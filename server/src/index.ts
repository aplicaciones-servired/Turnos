import Express from "express"
import cors from "cors"
import VendedoresRoutes from "./Routes/Vendedores.Routes"
import SucursalesRoutes from "./Routes/Sucursales.Routes"
import TurnosRoutes from "./Routes/Turnos.Routes"
import TarifasRoutes from "./Routes/Tarifas.Routes"
import ProgramacionesRoutes from "./Routes/Programaciones.Routes"
import NovedadesRoutes from "./Routes/Novedades.Routes"
import CalculoHorasRoutes from "./Routes/CalculoHoras.Routes"
import CalculoHoras from "./Models/CalculoHoras"
import log from 'morgan';

const app = Express();

app.use(Express.json());
app.use(cors());
app.use(log('dev'));

// Sincronizar modelo CalculoHoras
CalculoHoras.sync({ alter: false }).catch((err) => {
  console.warn('Nota: Tabla calculo_horas puede no existir. Debes crearla manualmente con el script SQL.');
});

app.use('/', VendedoresRoutes);
app.use('/', SucursalesRoutes);
app.use('/', TurnosRoutes);
app.use('/', TarifasRoutes);
app.use('/', ProgramacionesRoutes);
app.use('/', NovedadesRoutes);
app.use('/', CalculoHorasRoutes);

app.listen(3000, () => {
  console.log('Server is running on port localhost:3000');
});