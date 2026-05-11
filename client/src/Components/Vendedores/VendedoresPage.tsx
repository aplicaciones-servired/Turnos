import { useVendedores } from "@/Services/Vendedore.service";
import { useMemo, useState } from "react";
import "@/Css/index.css";

export function CompanyV() {
    const [red, setRed] = useState<"SERVIRED" | "MULTIRED">("SERVIRED");
    const centros = useMemo(
        () => (red === "SERVIRED" ? ["39632"] : ["39629", "39630", "39631"]),
        [red]
    );

    const { data: datos } = useVendedores(centros);
    const [filterName, setFilterName] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDocumento, setSelectedDocumento] = useState<string | null>(null);

    const datosFiltrados = useMemo(() => {
        const name = filterName.trim().toLowerCase();
        if (!name) return datos;
        return datos.filter((v) => v.NOMBRES.toLowerCase().includes(name));
    }, [datos, filterName]);

    return (
        <div className="App">
            <h1>Vendedores</h1>
            <label htmlFor="red">Red</label>
            <select
                name="red"
                id="red"
                value={red}
                onChange={(event) => setRed(event.target.value as "SERVIRED" | "MULTIRED")}
            >
                <option value="SERVIRED">SERVIRED</option>
                <option value="MULTIRED">MULTIRED</option>
            </select>
            <div style={{ marginTop: 8, position: "relative" }}>
                <label htmlFor="filterName">Filtrar por nombre</label>
                <input
                    id="filterName"
                    className="cursor-pointer"
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onClick={() => setIsOpen(true)}
                    placeholder="Escribe un nombre..."
                    style={{ marginLeft: 8 }}
                    autoComplete="off"
                />

                {/* Combobox dropdown */}
                {isOpen && (
                    <ul
                        className="scrollbar"
                    >
                        {datosFiltrados.length === 0 && (
                            <li style={{ padding: 8, color: "#666" }}>No hay resultados</li>
                        )}
                        {datosFiltrados.map((vendedor) => (
                            <li
                                key={vendedor.DOCUMENTO}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    setFilterName(vendedor.NOMBRES);
                                    setSelectedDocumento(vendedor.DOCUMENTO);
                                    setIsOpen(false);
                                }}
                                style={{ padding: 8, cursor: "pointer" }}
                            >
                                {vendedor.NOMBRES}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ marginTop: 8, color: "#333" }}>
                Seleccionado: {filterName || "-"} ({selectedDocumento ?? "-"})
            </div>
        </div>
    );
};