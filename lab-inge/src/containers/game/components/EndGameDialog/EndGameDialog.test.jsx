import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EndGameDialog from "./EndGameDialog";
import { vi } from "vitest";

// --- Mock de react-router-dom ---
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("EndGameDialog", () => {
  const mockAsesinoGana = {
    winners: [
      { id: 1, name: "Jugador Asesino" },
      { id: 2, name: "Jugador Cómplice" },
    ],
    regpileCount: 0,
  };

  const mockDetectivesGanan = {
    winners: [
      { id: 3, name: "Jugador Normal 1" },
      { id: 4, name: "Jugador Normal 2" },
    ],
    regpileCount: 5,
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

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

  it("navega al home al hacer clic en el botón", () => {
    const onCloseMock = vi.fn();
    render(<EndGameDialog winners={mockDetectivesGanan} onClose={onCloseMock} />);

    const button = screen.getByRole("button", { name: /volver a home/i });
    fireEvent.click(button);

    expect(onCloseMock).toHaveBeenCalledTimes(1); // cierra el diálogo
    expect(mockNavigate).toHaveBeenCalledWith("/home"); // navega al home
  });

  it("muestra mensaje correcto cuando type es 'social_disgrace'", () => {
    const mockSocialDisgrace = {
      type: "social_disgrace",
      winners: [{ id: 1, name: "Asesino Ganador" }],
      regpileCount: 0,
    };

    render(<EndGameDialog winners={mockSocialDisgrace} onClose={() => {}} />);

    expect(screen.getByText("El asesino ha ganado.")).toBeInTheDocument();
  });

  it("muestra mensaje correcto cuando type es 'murder_revealed'", () => {
    const mockMurderRevealed = {
      type: "murder_revealed",
      winners: [
        { id: 2, name: "Detective 1" },
        { id: 3, name: "Detective 2" },
      ],
      regpileCount: 5,
    };

    render(<EndGameDialog winners={mockMurderRevealed} onClose={() => {}} />);

    expect(screen.getByText("Los Detectives descubrieron al Asesino.")).toBeInTheDocument();
  });

  it("muestra mensaje correcto cuando un ganador tiene role 'asesino'", () => {
    const mockAsesinoRole = {
      winners: [
        { id: 1, name: "El Asesino", role: "Asesino" },
        { id: 2, name: "Cómplice", role: "Cómplice" },
      ],
      regpileCount: 3,
    };

    render(<EndGameDialog winners={mockAsesinoRole} onClose={() => {}} />);

    expect(screen.getByText("El asesino ha ganado.")).toBeInTheDocument();
  });

  it("muestra mensaje correcto cuando un ganador tiene role 'asesino' en minúsculas", () => {
    const mockAsesinoRoleLower = {
      winners: [
        { id: 1, name: "El Asesino", role: "asesino" },
      ],
      regpileCount: 2,
    };

    render(<EndGameDialog winners={mockAsesinoRoleLower} onClose={() => {}} />);

    expect(screen.getByText("El asesino ha ganado.")).toBeInTheDocument();
  });
});

