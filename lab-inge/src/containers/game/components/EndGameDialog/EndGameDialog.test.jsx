import { render, screen } from "@testing-library/react";
import EndGameDialog from "./EndGameDialog";

describe("EndGameDialog", () => {
  const mockWinners = [
    { id: 1, name: "Candela" },
    { id: 2, name: "Vsbev" },
  ];

  it("renderiza el título y la lista de ganadores", () => {
    render(<EndGameDialog winners={mockWinners} onClose={() => {}} />);

    expect(screen.getByText("PARTIDA FINALIZADA")).toBeInTheDocument();
    expect(screen.getByText("Ganadores:")).toBeInTheDocument();

    expect(screen.getByText("Candela")).toBeInTheDocument();
    expect(screen.getByText("Vsbev")).toBeInTheDocument();
  });

  it("renderiza la cantidad correcta de ganadores", () => {
    render(<EndGameDialog winners={mockWinners} onClose={() => {}} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(mockWinners.length);
  });

  it("maneja correctamente el caso sin ganadores", () => {
    render(<EndGameDialog winners={[]} onClose={() => {}} />);

    expect(screen.getByText("PARTIDA FINALIZADA")).toBeInTheDocument();

    const items = screen.queryAllByRole("listitem");
    expect(items).toHaveLength(0);
  });
});
