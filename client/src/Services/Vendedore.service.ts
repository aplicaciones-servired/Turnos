import { API_DATA } from "@/Utils/const";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Vendedores } from "@/Types/Vendedores";

export function useVendedores(centros?: string[]) {
  const [data, setData] = useState<Vendedores[]>([]);

  useEffect(() => {
    let cancelled = false;

    axios.get(`${API_DATA}/vendedores`)
      .then((response) => {
        const vendedores = response.data.datos as Vendedores[];

        if (cancelled) {
          return;
        }

        if (!centros?.length) {
          setData(vendedores);
          return;
        }

        const filtrados = vendedores.filter((vendedor) =>
          vendedor.CCOSTO ? centros.includes(vendedor.CCOSTO.trim()) : false
        );
        setData(filtrados);
      })
      .catch((error) => {
        console.error("Error al obtener vendedores:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [centros]);

  return { data };
}
