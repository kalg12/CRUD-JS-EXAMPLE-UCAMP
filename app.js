console.log("Hi");
let zoo = ["🐒", "🐯"];
localStorage.setItem("almacenamiento", zoo);
const eliminarLS = () => {
  localStorage.removeItem("almacenamiento");
  alert("Tu ls ha sido eliminado correctamente");
};

/* Crea una funcion para añadir otro emoji, un tiburon y almacenar en nuestro localstorage todo desde consola sin htmls*/
const agregarTiburon = () => {
  zoo.push("🦈");
  localStorage.setItem("almacenamiento", zoo);
  alert("Has añadido un tiburon a tu zoo");
};
