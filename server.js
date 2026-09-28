// Source - https://stackoverflow.com/a/46988108
// Posted by Rakesh, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-27, License - CC BY-SA 4.0

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration
