var path = require('path');
var scene, bg_scene;
var camera, bg_camera;
var renderer;
var model_library = {};
var available_models = ['pikachu']

load_models(available_models);

function randomize(time) {
  for (var j = 0; j < time; ++j) {
    random_background(['pokemon.png', 'pokemon1.jpg']);
    random_scene(available_models, "out.jpg");
    random_animate(['pokemon.png', 'pokemon1.jpg'], available_models, "out.jpg");
  }
}

function load_models(names) {
  for (var i in names) {
    var name = names[i];
    obj_path = path.join('./models/', name, name.concat('-pokemon-go.json'));
    try {
      loader = new THREE.ObjectLoader();
      loader.load(obj_path, function (obj) {
        model_library[name] = obj;
        randomize(1);
      });
    } catch (err) {
      console.log(err);
    }
  };
}

function rand_int(start, end) {
  return Math.floor(Math.random() * (end - start)) + start;
}

function random_background(choices) {
  randint = rand_int(0, choices.length);
  bg = choices[randint];
  var texture = new THREE.TextureLoader().load(bg);
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 0),
    new THREE.MeshBasicMaterial({map: texture}));
  mesh.material.depthTest = false;
  mesh.material.depthWrite = false;
  bg_scene = new THREE.Scene();
  bg_camera = new THREE.Camera();
  bg_scene.add(bg_camera);
  bg_scene.add(mesh);
}

function random_scene(names, fname) {
  aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 1, 10000);
  dist = rand_int(100, 300);
  console.log("camera ", dist);
  camera.position.z = dist;
  var vfov = camera.fov * Math.PI / 180;
  console.log('vfoc', vfov, camera.fov);
  var height = 2 * Math.tan(vfov / 2) * dist;
  var width = height * aspect;
  console.log('width ', width, ' height', height);
  scene = new THREE.Scene();
  scene.add(camera);
  for (var i in names) {
    var name = names[i];
    console.log("name", name, model_library, model_library[name], Object.keys(model_library));
    scene.add(model_library[name]);
  }

  // light
  var alight = new THREE.AmbientLight(0x404015, 4.2);
  var dlight = new THREE.DirectionalLight(0xffffff, 0.7);
  dlight.position.set(0, 1, 0);
  scene.add(alight);
  scene.add(dlight);

  renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function random_animate(bgs, models, fname) {
    id = requestAnimationFrame(random_animate);
    // x = rand_int(-100, 100);
    // y = rand_int(-100, 100);
    // z = rand_int(-50, 50);
    // random_background(bgs);
    // random_scene(models, fname);

    for (var k in model_library) {
      model_library[k].rotation.x = rand_int(-100, 100) * Math.PI / 180;
      model_library[k].rotation.y = rand_int(-100, 100) * Math.PI / 180;
      model_library[k].rotation.z = rand_int(-100, 100) * Math.PI / 180;
      model_library[k].position.x = rand_int(-60, 60);
      model_library[k].position.y = rand_int(-30, 30);
      model_library[k].position.z = rand_int(-30, 30);
    }

    // model_library[].rotation.x = x;
    // pikachu.rotation.y = y;
    // pikachu.rotation.z = z;
    // pikachu.position.x += 0.005;
    // pikachu.position.y -= 0.001;

    renderer.autoClear = false;
    renderer.clear();
    renderer.render(bg_scene, bg_camera);
    renderer.render(scene, camera);
    // cancelAnimationFrame(id);

}
