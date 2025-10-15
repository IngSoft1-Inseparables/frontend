import { render, screen } from "@testing-library/react";
import EndGameDialog from "./EndGameDialog";

describe("EndGameDialog", () => {
  const mockAsesinoGana = {
    winners: [
      { id: 1, name: "Jugador Asesino" },
      { id: 2, name: "Jugador Cómplice" },
    ],
    regpileCount: 0, // Mazo vacío => gana el asesino
  };

  const mockNormalesGanan = {
    winners: [
      { id: 3, name: "Jugador Normal 1" },
      { id: 4, name: "Jugador Normal 2" },
    ],
    regpileCount: 5, // Mazo con cartas => ganan los normales
  };

  it("muestra mensaje y lista correctos cuando gana el asesino", () => {
    render(<EndGameDialog winners={mockAsesinoGana} onClose={() => {}} />);

    // Título general
    expect(screen.getByText("PARTIDA FINALIZADA")).toBeInTheDocument();

    // Mensaje de victoria del asesino
    expect(
      screen.getByText(/el asesino/i)
    ).toBeInTheDocument();

    // Lista de ganadores
    expect(screen.getByText("Jugador Asesino")).toBeInTheDocument();
    expect(screen.getByText("Jugador Cómplice")).toBeInTheDocument();

    // Verifica cantidad de ganadores
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("muestra mensaje y lista correctos cuando ganan los jugadores normales", () => {
    render(<EndGameDialog winners={mockNormalesGanan} onClose={() => {}} />);

    expect(screen.getByText("PARTIDA FINALIZADA")).toBeInTheDocument();

    // Texto parcial para evitar problemas por HTML interno
    expect(screen.getByText(/jugadores descubrieron/i)).toBeInTheDocument();

    expect(screen.getByText("Jugador Normal 1")).toBeInTheDocument();
    expect(screen.getByText("Jugador Normal 2")).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("no renderiza nada si winners es null o undefined", () => {
    const { container: container1 } = render(
      <EndGameDialog winners={null} onClose={() => {}} />
    );
    expect(container1.firstChild).toBeNull();

    const { container: container2 } = render(
      <EndGameDialog winners={undefined} onClose={() => {}} />
    );
    expect(container2.firstChild).toBeNull();
  });

  it("muestra correctamente cuando no hay ganadores", () => {
    const mockEmpty = { winners: [], regpileCount: 3 };
    render(<EndGameDialog winners={mockEmpty} onClose={() => {}} />);

    expect(screen.getByText("PARTIDA FINALIZADA")).toBeInTheDocument();
    expect(screen.getByText(/jugadores descubrieron/i)).toBeInTheDocument();

    const items = screen.queryAllByRole("listitem");
    expect(items).toHaveLength(0);
  });
});
