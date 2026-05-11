import Express from "express"
import cors from "cors"
import VendedoresRoutes from "./Routes/Vendedores.Routes"
import TurnosRoutes from "./Routes/Turnos.Routes"
import TarifasRoutes from "./Routes/Tarifas.Routes"
import ProgramacionesRoutes from "./Routes/Programaciones.Routes"
import NovedadesRoutes from "./Routes/Novedades.Routes"
import log from 'morgan';

const app = Express()

app.use(Express.json())
app.use(cors())
app.use(log('dev'));
app.use(VendedoresRoutes)
app.use(TurnosRoutes)
app.use(TarifasRoutes)
app.use(ProgramacionesRoutes)
app.use(NovedadesRoutes)

app.listen(3000, () => {
  console.log("Server is running on port localhost:3000")
})