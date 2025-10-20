import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWSService } from "./WSService";

// --- Mock global de WebSocket ---
let lastWsInstance = null;

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.sentMessages = [];
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;

    lastWsInstance = this; // guardamos última instancia
    // Simular conexión exitosa asincrónica
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    }, 5);
  }

  send(msg) {
    this.sentMessages.push(msg);
  }

  close(code = 1000, reason = "") {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code, reason });
  }
}

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSED = 3;

global.WebSocket = MockWebSocket;

// --- TESTS ---
describe("createWSService", () => {
  let service;

  beforeEach(() => {
    vi.useFakeTimers();
    service = createWSService("123", "456");
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it("construye correctamente la URL con parámetros", () => {
    expect(service).toBeDefined();
  });

  it("se conecta correctamente y emite 'connection_status' en open", async () => {
    const callback = vi.fn();
    service.on("connection_status", callback);
    service.connect();

    await vi.advanceTimersByTimeAsync(10);
    expect(callback).toHaveBeenCalledWith({ status: "connected" });
  });

  it("envía mensajes correctamente cuando está conectado", async () => {
    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    service.send({ type: "ping" });
    const wsInstance = service.isConnected();
    expect(wsInstance).toBe(true);
    expect(lastWsInstance.sentMessages.length).toBeGreaterThan(0);
  });

  it("no envía mensajes si no está conectado", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    service.send({ test: "data" });
    expect(warnSpy).toHaveBeenCalled();
  });

  it("maneja mensajes recibidos correctamente", async () => {
    const updateCallback = vi.fn();
    service.on("game_public_update", updateCallback);

    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    const msg = { game_public_update: { players_amount: 2 } };
    lastWsInstance.onmessage({ data: JSON.stringify(msg) });

    expect(updateCallback).toHaveBeenCalledWith({ players_amount: 2 });
  });

  it("maneja mensajes tipo 'pong' sin emitir eventos", async () => {
    const spyLog = vi.spyOn(console, "log").mockImplementation(() => {});
    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    lastWsInstance.onmessage({ data: JSON.stringify({ type: "pong" }) });
    expect(spyLog).not.toHaveBeenCalledWith(
      expect.stringContaining("pong")
    );
  });

  it("reconecta automáticamente al cerrar con error", async () => {
    const reconnectSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    // Simular cierre con código ≠ 1000
    lastWsInstance.onclose({ code: 4001, reason: "error" });
    await vi.advanceTimersByTimeAsync(2000);

    expect(
      reconnectSpy.mock.calls.some(([msg]) =>
        msg.includes("Reintentando conexión")
      )
    ).toBe(true);
  });

  it("no reconecta si se desconecta manualmente", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    // Simular conexión activa
    const wsInstance = lastWsInstance;

    // Desconexión manual (marca el flag)
    service.disconnect();

    // Disparar el evento close para simular desconexión del socket
    wsInstance.onclose?.({ code: 4000, reason: "error" });
    await vi.advanceTimersByTimeAsync(2000);

    // Verificamos que NO haya mensajes de reconexión
    const triedReconnect = logSpy.mock.calls.some(([msg]) =>
      msg.includes("Reintentando conexión")
    );
    expect(triedReconnect).toBe(false);
  });

  it("no intenta reconectar si la desconexión fue manual", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    // Desconexión manual
    service.disconnect();

    // Simular evento close posterior
    lastWsInstance.onclose?.({ code: 4000, reason: "error" });
    await vi.advanceTimersByTimeAsync(2000);

    // No debería haberse intentado reconectar
    const attempted = logSpy.mock.calls.some(([msg]) =>
      msg.includes("Reintentando conexión")
    );
    expect(attempted).toBe(false);
  });


  it("limpia listeners al desconectarse", async () => {
    const callback = vi.fn();
    service.on("test_event", callback);
    service.disconnect();

    service.send({ type: "something" });
    expect(callback).not.toHaveBeenCalled();
  });

  it("maneja error al conectar", async () => {
    global.WebSocket = vi.fn(() => {
      throw new Error("Connection failed");
    });

    const newService = createWSService();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    newService.connect();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to connect to WebSocket"),
      expect.any(Error)
    );

    global.WebSocket = MockWebSocket; // restaurar
  });

  it("maneja errores en listeners sin romper ejecución", async () => {
    const badCallback = vi.fn(() => {
      throw new Error("boom");
    });
    service.on("test", badCallback);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    lastWsInstance.onmessage({
      data: JSON.stringify({ type: "test", payload: {} }),
    });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error en listener de 'test'"),
      expect.any(Error)
    );
  });

  it("maneja error al parsear JSON inválido", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    lastWsInstance.onmessage({ data: "{invalidJson" });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("❌ Error al parsear mensaje:"),
      expect.any(Error)
    );
  });

 

  it("no agrega listeners duplicados y los elimina con off", async () => {
    const cb = vi.fn();
    service.on("dupEvent", cb);
    service.on("dupEvent", cb); // duplicado no se agrega

    service.off("dupEvent", cb);
    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    lastWsInstance.onmessage({
      data: JSON.stringify({ type: "dupEvent", payload: {} }),
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it("inicia y detiene correctamente el heartbeat", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    service.connect();
    await vi.advanceTimersByTimeAsync(10);

    // Simular heartbeat (envía ping y timeout)
    vi.advanceTimersByTime(30000);
    lastWsInstance.readyState = MockWebSocket.OPEN;

    // Debería enviar un ping sin errores
    expect(errorSpy).not.toHaveBeenCalled();

    // Simular timeout del heartbeat
    vi.advanceTimersByTime(10000);
    expect(lastWsInstance.readyState).toBe(MockWebSocket.CLOSED);
  });
});
