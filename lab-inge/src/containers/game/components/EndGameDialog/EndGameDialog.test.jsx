import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EndGameDialog from "./EndGameDialog";

describe("EndGameDialog", () => {
  const mockAsesinoGana = {
    winners: [
      { id: 1, name: "Jugador Asesino" },
      { id: 2, name: "Jugador Cómplice" },
    ],
    regpileCount: 0, // Mazo vacío => gana el asesino
  };

  const mockDetectivesGanan = {
    winners: [
      { id: 3, name: "Jugador Normal 1" },
      { id: 4, name: "Jugador Normal 2" },
    ],
    regpileCount: 5, // Mazo con cartas => ganan los detectives
  };

  it("renderiza correctamente cuando gana el asesino", () => {
    render(<EndGameDialog winners={mockAsesinoGana} onClose={() => {}} />);

    expect(screen.getByText("PARTIDA FINALIZADA")).toBeInTheDocument();
    expect(
      screen.getByText("El Asesino (y el Cómplice, si existe) ha ganado la partida.")
    ).toBeInTheDocument();

    const winners = screen.getAllByRole("listitem");
    expect(winners).toHaveLength(2);
    expect(winners[0]).toHaveTextContent("Jugador Asesino");
    expect(winners[1]).toHaveTextContent("Jugador Cómplice");
  });

  it("renderiza correctamente cuando ganan los detectives", () => {
    render(<EndGameDialog winners={mockDetectivesGanan} onClose={() => {}} />);

    expect(screen.getByText("PARTIDA FINALIZADA")).toBeInTheDocument();
    expect(
      screen.getByText("Los Detectives descubrieron al Asesino.")
    ).toBeInTheDocument();

    const winners = screen.getAllByRole("listitem");
    expect(winners).toHaveLength(2);
    expect(winners[0]).toHaveTextContent("Jugador Normal 1");
    expect(winners[1]).toHaveTextContent("Jugador Normal 2");
  });

  it("no renderiza nada si winners es null o undefined", () => {
    const { container: c1 } = render(<EndGameDialog winners={null} onClose={() => {}} />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<EndGameDialog winners={undefined} onClose={() => {}} />);
    expect(c2.firstChild).toBeNull();
  });

  it("muestra correctamente estructura aunque la lista de ganadores esté vacía", () => {
    const mockEmpty = { winners: [], regpileCount: 3 };
    render(<EndGameDialog winners={mockEmpty} onClose={() => {}} />);

    expect(screen.getByText("PARTIDA FINALIZADA")).toBeInTheDocument();
    expect(
      screen.getByText("Los Detectives descubrieron al Asesino.")
    ).toBeInTheDocument();

    const items = screen.queryAllByRole("listitem");
    expect(items).toHaveLength(0);
  });
});
