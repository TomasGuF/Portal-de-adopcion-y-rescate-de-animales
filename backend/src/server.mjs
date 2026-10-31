import {app} from './app.mjs';
const port=Number(process.env.PORT || 3001);
app.listen(port,'0.0.0.0',()=>console.log(`PatitasGo API en puerto ${port}`));
