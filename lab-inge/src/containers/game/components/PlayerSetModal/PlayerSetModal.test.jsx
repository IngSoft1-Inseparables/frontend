import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PlayerSetsModal from "./PlayerSetModal";
// Mock de SetDeck
vi.mock("../SetDeck/SetDeck", () => ({
  __esModule: true,
  default: ({ setPlayed, onSetClick, playerId }) => (
    <div data-testid="setdeck-mock">
      SetDeck - {setPlayed.length} sets
      {onSetClick && (
        <button 
          data-testid="mock-set-button"
          onClick={() => onSetClick(playerId, 0)}
        >
          Click Set
        </button>
      )}
    </div>
  ),
}));

describe("PlayerSetsModal", () => {
  const basePlayers = [
    {
      id: 1,
      name: "Micaela",
      setPlayed: [
        { id: "set1", cards: [1, 2, 3] },
        { id: "set2", cards: [4, 5, 6] },
      ],
    },
    {
      id: 2,
      name: "Norma",
      setPlayed: [],
    },
  ];

  it("no renderiza nada si modalPlayerId es null", () => {
    const { container } = render(
      <PlayerSetsModal
        modalPlayerId={null}
        orderedPlayers={basePlayers}
        closeSetModal={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza correctamente el modal con sets", () => {
    render(
      <PlayerSetsModal
        modalPlayerId={1}
        orderedPlayers={basePlayers}
        closeSetModal={() => {}}
      />
    );

    expect(screen.getByText("Micaela - Set Jugado")).toBeInTheDocument();
    expect(screen.getByTestId("setdeck-mock")).toHaveTextContent("2 sets");
    // Verifica estructura base
    expect(screen.getByRole("button", { name: "✕" })).toBeInTheDocument();
  });

  it("usa el ancho mínimo de 320px si el jugador no tiene sets", () => {
    const { container } = render(
      <PlayerSetsModal
        modalPlayerId={2}
        orderedPlayers={basePlayers}
        closeSetModal={() => {}}
      />
    );
    const modal = container.querySelector("div[style]");
    expect(modal.style.width).toBe("320px");
  });

  it("calcula correctamente el ancho dinámico según la cantidad de sets", () => {
    // setLength = 2 → contentWidth = (2 * 120) + ((2 - 1) * 8) = 248 → dynamic = 248 + 48 = 296 → se aplica 320 (mínimo)
    const { container, rerender } = render(
      <PlayerSetsModal
        modalPlayerId={1}
        orderedPlayers={basePlayers}
        closeSetModal={() => {}}
      />
    );
    let modal = container.querySelector("div[style]");
    expect(modal.style.width).toBe("320px"); // mínimo aplicado

    // Agregar más sets → debería superar 320px
    const moreSets = [
      { id: "s1" }, { id: "s2" }, { id: "s3" }, { id: "s4" },
    ];
    const updatedPlayers = [
      { id: 3, name: "Laura", setPlayed: moreSets },
    ];
    rerender(
      <PlayerSetsModal
        modalPlayerId={3}
        orderedPlayers={updatedPlayers}
        closeSetModal={() => {}}
      />
    );
    modal = container.querySelector("div[style]");
    // setLength = 4 → contentWidth = (4 * 120) + (3 * 8) = 504 → +48 = 552
    expect(modal.style.width).toBe("552px");
  });

  it("llama a closeSetModal al hacer click en el fondo o en el botón ✕", () => {
    const closeMock = vi.fn();
    const { container } = render(
      <PlayerSetsModal
        modalPlayerId={1}
        orderedPlayers={basePlayers}
        closeSetModal={closeMock}
      />
    );

    const overlay = container.firstChild;
    const closeButton = screen.getByRole("button", { name: "✕" });

    fireEvent.click(overlay);
    fireEvent.click(closeButton);

    expect(closeMock).toHaveBeenCalledTimes(2);
  });

  it("no cierra el modal al hacer click dentro del contenido (stopPropagation)", () => {
    const closeMock = vi.fn();
    const { container } = render(
      <PlayerSetsModal
        modalPlayerId={1}
        orderedPlayers={basePlayers}
        closeSetModal={closeMock}
      />
    );

    const innerDiv = container.querySelector(".relative");
    fireEvent.click(innerDiv);

    expect(closeMock).not.toHaveBeenCalled();
  });

  it("cierra el modal y llama a onSetSelect cuando se selecciona un set", () => {
    const closeMock = vi.fn();
    const onSetSelectMock = vi.fn();
    
    render(
      <PlayerSetsModal
        modalPlayerId={1}
        orderedPlayers={basePlayers}
        closeSetModal={closeMock}
        onSetSelect={onSetSelectMock}
        selectionMode="select-set"
      />
    );

    const setButton = screen.getByTestId("mock-set-button");
    fireEvent.click(setButton);

    // Debe llamar a onSetSelect con los parámetros correctos
    expect(onSetSelectMock).toHaveBeenCalledWith(1, 0);
    expect(onSetSelectMock).toHaveBeenCalledTimes(1);
    
    // Debe cerrar el modal
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
