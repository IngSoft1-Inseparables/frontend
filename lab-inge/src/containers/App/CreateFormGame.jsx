import { useState } from "react";
import GenericButton from "../../components/JoinGameDialog/GenericButton";

export default function CreateFormGame({ onSubmit, onClose }) {
  // Estado de formulario jugador

  const [playerData, setPlayerData] = useState({
    name: "",
    birthday: "",
    avatar: null,
  });

  // Estado de formulario partida

  const [formDataGame, setFormDataGame] = useState({
    nameGame: "",
    maxPlayers: "",
    minPlayers: "",
  });

  // Otros estados
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatar = [
    "avatar/avatar1.png",
    "avatar/avatar2.png",
    "avatar/avatar3.png",
    "avatar/avatar4.png",
    "avatar/avatar5.png",
    "avatar/avatar6.png",
  ];
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Actualiza inputs jugador
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "Ingresar nombre de usuario";
      case "birthday": {
        if (!value) return "Ingresar fecha de nacimiento";
        const minDate = new Date(1960, 0, 1); // meses base 0
        const maxDate = new Date(2013, 11, 31);
        const [year, month, day] = value.split("-").map(Number);
        const selectedDate = new Date(year, month - 1, day);
        if (selectedDate < minDate || selectedDate > maxDate) {
          return `La fecha debe estar entre ${minDate.toLocaleDateString()} y ${maxDate.toLocaleDateString()}`;
        }
        return ""; // <--- Muy importante
      }
      case "avatar":
        return value ? "" : "Seleccioná un avatar";
      case "nameGame":
        return value.trim() ? "" : "Ingresar nombre para la partida";
      default:
        return "";
    }
  };

  const updateInputState = (name, value) => {
    if (name === "name" || name === "birthday") {
      setPlayerData((prev) => ({ ...prev, [name]: value }));
    } else if (
      name === "nameGame" ||
      name === "minPlayers" ||
      name === "maxPlayers"
    ) {
      setFormDataGame((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateInputState(name, value);
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all required fields
    const combinedData = { ...playerData, ...formDataGame };
    Object.keys(combinedData).forEach((key) => {
      const error = validateField(key, combinedData[key]);
      if (error) newErrors[key] = error;
    });

    const min = parseInt(formDataGame.minPlayers);
    const max = parseInt(formDataGame.maxPlayers);
    if (!isNaN(min) && !isNaN(max) && min > max) {
      newErrors.minPlayers = "El mínimo no puede ser mayor que el máximo";
    } else if (isNaN(min)) {
      newErrors.minPlayers = "Completar la cantidad de jugadores";
    } else if (isNaN(max)) {
      newErrors.maxPlayers = "Completar la cantidad de jugadores";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(playerData, formDataGame);
      setPlayerData({
        name: "",
        birthday: "",
        avatar: null,
      });
      setFormDataGame({
        nameGame: "",
        maxPlayers: "",
        minPlayers: "",
      });
      setErrors({});
      // setIsOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        "Failed to create the game. Please check your input and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clases dinámicas para inputs

  const getInputClassName = (fieldName, type = "input") => {
    const baseInput =
      "w-full px-4 py-2 border rounded-md bg-[#303030] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors";
    const baseSelect =
      "w-full pl-3 pr-8 py-2 border rounded-md bg-[#303030] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors appearance-none flex-1";

    const baseClasses = type === "select" ? baseSelect : baseInput;

    const errorClasses = errors[fieldName]
      ? "border-red-800 focus:ring-red-500"
      : "border-gray-600 focus:ring-orange-500";

    return `${baseClasses} ${errorClasses}`;
  };

  return (
    <div>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center"
        onClick={onClose} // cerrar al clickear el fondo
      >
        <div
          className="rounded-lg p-12 bg-[#7a6655] w-auto max-w-lg"
          style={{ backgroundColor: "#7a6655" }}
          onClick={(e) => e.stopPropagation()}
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full sm:max-w-lg md:max-w-xl lg:max-w-4xl mx-auto"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Crear nueva partida
            </h2>
            <div>
              <label className="grid gap-1 block text-sm font-medium text-white mb-1 text-sm sm:text-base md:text-lg lg:text-lg">
                Nombre de Usuario:
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={playerData.name}
                  onChange={handleChange}
                  className={getInputClassName("name")}
                  placeholder="Ingresar nombre de Usuario"
                  autoComplete="off"
                />
              </label>

              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="grid gap-1 block text-sm font-medium text-white mb-1 text-sm sm:text-base md:text-lg lg:text-lg">
                Fecha de nacimiento:
                <input
                  type="date"
                  name="birthday"
                  value={playerData.birthday}
                  onChange={handleChange}
                  className={getInputClassName("birthday")}
                />
              </label>
              {errors.birthday && (
                <p className="mt-1 text-sm text-red-400">{errors.birthday}</p>
              )}
            </div>{" "}
            <label
              htmlFor="Avatar"
              className="block text-sm font-medium text-white mb-1 text-sm sm:text-base md:text-lg lg:text-lg"
            >
              Seleccion un avatar:
            </label>
            <div className="avatar-container flex flex-wrap justify-center gap-4 bg-transparent p-2">
              {avatar.map((av, index) => (
                <img
                  key={index}
                  src={av}
                  alt={`Avatar ${index + 1}`}
                  className={`
                                w-20 h-20 rounded-full border-3 cursor-pointer
                                transition-transform duration-200 ease-in-out
                                transform-gpu origin-center
                                ${
                                  selectedAvatar === av
                                    ? "border-orange-500 scale-120 shadow-lg"
                                    : "border-gray-400"
                                }
                                hover:scale-105 hover:border-orange-300
                              `}
                  onClick={() => {
                    setSelectedAvatar(av);
                    setPlayerData((prev) => ({ ...prev, avatar: av }));
                    setErrors((prev) => ({ ...prev, avatar: "" }));
                  }}
                />
              ))}
              {errors.avatar && (
                <p className="mt-1 text-sm text-red-400">{errors.avatar}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="nameGame"
                className="block text-sm font-medium text-white mb-1 text-sm sm:text-base md:text-lg lg:text-lg"
              >
                Nombre de la Partida:
                <input
                  type="text"
                  id="nameGame"
                  name="nameGame"
                  value={formDataGame.nameGame}
                  onChange={handleChange}
                  className={getInputClassName("nameGame")}
                  placeholder="Ingresar nombre de la partida"
                  autoComplete="off"
                />
              </label>
              {errors.nameGame && (
                <p className="mt-1 text-sm text-red-400">{errors.nameGame}</p>
              )}
            </div>
            <label
              htmlFor="CantidadJugadores"
              className="block text-sm font-medium text-white mb-1 text-sm sm:text-base md:text-lg lg:text-lg"
            >
              Cantidad de jugadores:
            </label>
            <div className="flex flex-row justify-between w-full gap-4">
              <select
                type="text"
                id="minPlayers"
                name="minPlayers"
                value={formDataGame.minPlayers}
                onChange={handleChange}
                className={getInputClassName("minPlayers", "select")}
                placeholder="Ingresar minimo de jugadores"
              >
                <option value="" disabled>
                  Minimo de jugadores
                </option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
              <select
                type="text"
                id="maxPlayers"
                name="maxPlayers"
                value={formDataGame.maxPlayers}
                onChange={handleChange}
                className={getInputClassName("maxPlayers", "select")}
              >
                <option value="" disabled>
                  Maximo de jugadores
                </option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>
            {errors.minPlayers && (
              <p className="mt-1 text-sm text-red-400">{errors.minPlayers}</p>
            )}
            {errors.maxPlayers && (
              <p className="mt-1 text-sm text-red-400">{errors.maxPlayers}</p>
            )}
            <GenericButton disabled={
                isSubmitting || Object.keys(errors).some((key) => errors[key])
              }  type="submit" className="px-4 py-2.5" nameButton='Crear Partida'/>
          </form>
        </div>
      </div>
    </div>
  );
}
