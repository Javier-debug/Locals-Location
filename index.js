const loggedout = document.querySelectorAll(".logged-out")
const loggedin = document.querySelectorAll(".logged-in")
const logged = document.querySelectorAll(".logged");
const unlogged = document.querySelector(".unlogged");
var auth = firebase.auth();
const db = firebase.firestore();
var salir = document.getElementById("salir");
var localsList = document.getElementById("localsList");
const body = document.getElementById("body");
var imgLogo = document.getElementById("imgLogo");
var coordenadasLocal = null;
const datosdelacuenta = document.querySelector(".datosdelacuenta");
//var userInfo = document.getElementById("userInfo");
var uidEmpresa = "";
var map;
var locals = [];
var localsDrawed = [];
var API = "https://ancient-dawn-65400.herokuapp.com/api/locals/";
const formaingresar = document.getElementById("formaingresar");
const formaagregar = document.getElementById("formaagregar");
const formaractualizar = document.getElementById("formaractualizar");


auth.onAuthStateChanged(user => {
  if(user) {
    db.collection("empresas").doc(user.uid).get().then(doc => {
      const html = `
      <img src="${doc.data().logo}" width="auto" height="60px"/>
      <p>Nombre comercial: ${doc.data().nombreC}</p>
      <p>Razon Social: ${doc.data().razonSocial}</p>
      `;

      datosdelacuenta.innerHTML = html;
      imgLogo.src = doc.data().logo;
    });
    console.log("Entro")
    optionsMenu(user);
    getLocals(user.uid);
  }
  else {
    //body.style.backgroundColor = "gray"
    console.log(user)
    borraMarcadores(false);
    optionsMenu();
  }
});

const optionsMenu = (user) => {
  if(user) {
    uidEmpresa = user.uid;
    console.log(uidEmpresa)
    loggedin.forEach(item => item.style.display = "block")
    loggedout.forEach(item => item.style.display = "none")
    unlogged.style.display = "none"
    logged.forEach(item => item.style.display = "block")
  }
  else {
    unlogged.style.display = "block"
    loggedin.forEach(item => item.style.display = "none")
    loggedout.forEach(item => item.style.display = "block")
    logged.forEach(item => item.style.display = "none")
  }
}

formaingresar.addEventListener("submit", (e) => {
  e.preventDefault();

  let correo = formaingresar['correo'].value;
  let contrasenia = formaingresar['contrase??a'].value;

  auth.signInWithEmailAndPassword(correo, contrasenia).then(credencial => {
    $('#ingresarModal').modal('hide');
    formaingresar.reset();
    formaingresar.querySelector('.error').innerHTML = ''
  }).catch(error => {
    console.log(error);
    formaingresar.querySelector('.error').innerHTML = mensajeError(error.code)
  });
})

formaagregar.addEventListener("submit", (e) => {
  e.preventDefault();
  const local = {
    coor: coordenadasLocal,
    image: formaagregar['agImagen'].value,
    status: formaagregar['agStatus'].value,
    ubicacion: formaagregar['agUbicacion'].value
  }
  console.log(local)
  const body = JSON.stringify(local)
  fetch(API + uidEmpresa, {
    method: "POST",
    body: body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then((response) => {
    $('#agregarModal').modal('hide');
    formaagregar.reset();
    borraMarcadores(true);
    return response;
  })
})

formaractualizar.addEventListener("submit", (e) => {
  e.preventDefault();

  var localId = "";
  for (var a = 0; a < locals.length; a++) {
    if (locals[a].coor.lat == coordenadasLocal.lat && locals[a].coor.lng == coordenadasLocal.lng) {
      localId = locals[a].id;
    }
  }
  const local = {
    coor: coordenadasLocal,
    image: formaractualizar['acImagen'].value,
    status: formaractualizar['acStatus'].value,
    ubicacion: formaractualizar['acUbicacion'].value
  }
  console.log(local)
  const body = JSON.stringify(local)
  fetch(API + localId, {
    method: "PUT",
    body: body,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then((response) => {
    $('#actualizarModal').modal('hide');
    formaractualizar.reset();
    borraMarcadores(true);
    return response;
  })
})

function mensajeError(codigo) {
  let mensaje = '';
  switch(codigo) {
    case 'auth/wrong-password': 
    mensaje = "Contrase??a incorrecta"
    break;
    case 'auth/user-not-found': 
    mensaje = "Usuario no encontrado"
    break;
    case 'auth/weak-password': 
    mensaje = "Contrase??a debil"
    break;
    default: 
    mensaje = "Occurio un error al ingresar con este usuario"
  }
  return mensaje;
}

salir.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut()
})

function iniciaMapa() {
  var coordenadas = {
    lat: 21.14785,
    lng: -101.70345
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: coordenadas,
    zoom: 15,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ],
    fullscreenControl: false,
  });

  map.addListener("click", (mapsMouseEvent) => {
    // Close the current InfoWindow.
    // Create a new InfoWindow.
    var infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    coordenadasLocal = mapsMouseEvent.latLng.toJSON()
    infoWindow.setContent(
      //JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
      `<button type="button" class="btn btn-success" data-toggle="modal" data-target="#agregarModal">Agregar</button>`
    );
    infoWindow.open(map);
    setTimeout( function(){ infoWindow.close(); console.log("Entro")}, 3000);
  });
}

function getLocals(userUID) {
  console.log("entro 2")
  fetch(API + userUID, {
    method: "GET",
  })
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    locals = data;
    console.log(locals)
    putLocalsInMap();
  })
} 

var putLocalsInMap = () => {
  var icon = "";
  locals.forEach(local => {
    if (local.status == "Excelente") {
      icon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
    } 
    else if (local.status == "Estable") {
      icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    } 
    else {
      icon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    }
    var marker = new google.maps.Marker({
      map: map,
      title: '<strong>' + local.ubicacion + '</strong>' ,
      icon: icon,
      position: local.coor,
    });

    localsDrawed.push(marker);
    google.maps.event.addListener(marker, 'mouseover', function(){
      coordenadasLocal = local.coor;
      console.log(local.coor)
      formaractualizar['acImagen'].value = local.image
      formaractualizar['acStatus'].value = local.status
      formaractualizar['acUbicacion'].value = local.ubicacion
      var content = `<img src="${local.image}" width="auto" height="60px"/>
      <br/>
      <strong>Status: </strong> ${local.status}
      <br/>
      <strong>Ubicacion: </strong> ${local.ubicacion}
      <br/>
      <hr>
      <button type="button" class="btn btn-warning" data-toggle="modal" data-target="#actualizarModal">Actualizar</button>
      <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#eliminarModal">Eliminar</button>`
      var infowindow = new google.maps.InfoWindow({
        content : content,
        position : this.position
      });
      infowindow.open(map);
      setTimeout( function(){ infowindow.close(); }, 3000);
    });
    let position = document.createElement("button");
    position.className = "list-group-item list-group-item-action"
    position.type = "button"
    position.innerHTML = local.ubicacion
    position.onclick = function() {
      map.setCenter(local.coor)
      coordenadasLocal = local.coor;
      console.log(local.coor)
      formaractualizar['acImagen'].value = local.image
      formaractualizar['acStatus'].value = local.status
      formaractualizar['acUbicacion'].value = local.ubicacion
      var content = `<img src="${local.image}" width="auto" height="60px"/>
      <br/>
      <strong>Status: </strong> ${local.status}
      <br/>
      <strong>Ubicacion: </strong> ${local.ubicacion}
      <br/>
      <hr>
      <button type="button" class="btn btn-warning" data-toggle="modal" data-target="#actualizarModal">Actualizar</button>
      <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#eliminarModal">Eliminar</button>`
      var infowindow = new google.maps.InfoWindow({
        content : content,
        position : local.coor
      });
      infowindow.open(map);
      setTimeout( function(){ infowindow.close(); }, 3000);
    }
    localsList.appendChild(position)
  })
} 

async function eliminarLocal() {
  console.log("Entro")
  var localId = "";
  for (var a = 0; a < locals.length; a++) {
    if (locals[a].coor.lat == coordenadasLocal.lat && locals[a].coor.lng == coordenadasLocal.lng) {
      localId = locals[a].id;
    }
  }
  await fetch(API + localId, {
    method: "DELETE",
  })
  .then(async (response) => {
    $('#eliminarModal').modal('hide');
    borraMarcadores(true);
    return await response;
  })
}

function borraMarcadores(a){
  for ( var i =0; i < localsDrawed.length; i++) {
    localsDrawed[i].setMap(null);
  };
  while( localsList.hasChildNodes()){
    localsList.removeChild(localsList.firstChild);
  }
  localsDrawed = [];
  if(a == true) {
    getLocals(uidEmpresa);
  }
}