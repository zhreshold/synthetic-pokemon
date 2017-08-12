var path = require('path');
var sync = require('synchronize');
var rnorm = require('randgen').rnorm;
var fiber = sync.fiber;
var await = sync.await;
var defer = sync.defer;

var scene, bg_scene;
var camera, bg_camera;
var renderer;
var canvas;
var id;
var model_library = {};
var available_models = ['pikachu']
var pause = false;
var bg_mesh;
var global_counter = 0;
var counter_limit = 1000;
var backgrounds = {};
var alight;
var dlight;

var folder = "output";
var annotation_foler = "annotations";
var label;


init();
fiber(function() {
  await(load_backgrounds(['pokemon.png', 'pokemon1.jpg'], defer()));
  await(load_models(available_models, defer()));
  await(lock(defer()));
  await(randomize(100, defer()));
  // var result = await(lock(models, defer()));
});

// load_backgrounds(['pokemon.png', 'pokemon1.jpg']);
// console.log("all finished.")
// load_models(available_models);
// load_backgrounds(['pokemon.png', 'pokemon1.jpg'])
// randomize(10);

function lock(cb) {
  //
  console.log('abc')
  console.log(Object.keys(model_library).length, Object.keys(backgrounds).length);
  cb();
  // console.log(bgs)
}

function randomize(time, cb) {
  for (var j = 0; j < time; ++j) {
    // pause = false;
    random_background(['pokemon.png', 'pokemon1.jpg']);
    random_scene(available_models, "out.jpg");
    // pause = false;
    random_animate(['pokemon.png', 'pokemon1.jpg'], available_models, "out.jpg");
    // pause = true;
    cancelAnimationFrame( id );
    save_image(path.join(folder, 'out'));
  }
  cb();
}

function load_models(names, cb) {
  // var model_library = {};
  var task_count = names.length;
  var loader = new THREE.ObjectLoader();
  var onComplete = function() {
    cb();
    console.log(Object.keys(model_library))
  }
  fiber(function() {
      for (var i in names) {
        (function(index) {
          var name = names[index];
          obj_path = path.join('./models/', name, name.concat('-pokemon-go.json'));
          loader.load(obj_path,
            function ( obj ) {
              model_library[name] = obj;
              console.log(obj_path, 'loaded.')
              if (--task_count === 0) {
                onComplete();
              }
            },
            // Function called when download progresses
          	function ( xhr ) {
          		// console.log( (xhr.loaded / xhr.total * 100) + '% obj loaded' );
          	},
          	// Function called when download errors
          	function ( xhr ) {
          		console.log( 'An error happened' );
              if (--task_count === 0) {
                onComplete();
              }
          	});
        })(i);
      }
    });
  return model_library;
  // for (var i in names) {
  //   var name = names[i];
  //   obj_path = path.join('./models/', name, name.concat('-pokemon-go.json'));
  //   console.log(obj_path);
  //   var loader = new THREE.ObjectLoader();
  //   // Function when resource is loaded
  //   loader.load(obj_path,
  //     function ( obj ) {
  //       model_library[name] = obj;
  //       task_count += 1;
  //     },
  //     // Function called when download progresses
  //   	function ( xhr ) {
  //   		// console.log( (xhr.loaded / xhr.total * 100) + '% obj loaded' );
  //   	},
  //   	// Function called when download errors
  //   	function ( xhr ) {
  //   		console.log( 'An error happened' );
  //       task_count += 1;
  //   	});
  //   };
}

function load_backgrounds(choices, cb) {
  // var backgrounds = {};
  var task_count = choices.length;
  var loader = new THREE.TextureLoader();
  var onComplete = function() {
    console.log(Object.keys(backgrounds))
    cb();
  }
  for (var i in choices) {
    (function(index) {
      var choice = choices[index];
      choice_path = path.join('./backgrounds/', choice);
      console.log(choice_path);
      // var texture_loader = new THREE.TextureLoader();
      // var texture;
      var texture = loader.load(
        choice_path,
        function ( texture ) {
        // do something with the texture
          backgrounds[choice] = texture;
          // task_count += 1;
          console.log("loaded", choice);
          if (--task_count === 0) {
            onComplete();
          }
        },
        // Function called when download progresses
        function ( xhr ) {
          // console.log( (xhr.loaded / xhr.total * 100) + '% texture loaded' );
        },
        // Function called when download errors
        function ( xhr ) {
          console.log( 'An error happened' );
          if (--task_count === 0) {
            onComplete();
          }
        }
      );
    })(i);
  }
  return backgrounds;
  // var num_task = choices.length;
  // var task_count = 0;
  // // console.log(choices);
  // for (var i in choices) {
  //   (function(index) {
  //     var choice = choices[index];
  //     choice_path = path.join('./backgrounds/', choice);
  //     console.log(choice_path);
  //     var texture_loader = new THREE.TextureLoader();
  //     var texture;
  //     texture = texture_loader.load(
  //       choice_path,
  //       function ( texture ) {
  //   		// do something with the texture
  //   		  backgrounds[choice] = texture;
  //         task_count += 1;
  //         console.log("loaded", choice);
  //     	},
  //     	// Function called when download progresses
  //     	function ( xhr ) {
  //     		console.log( (xhr.loaded / xhr.total * 100) + '% texture loaded' );
  //     	},
  //     	// Function called when download errors
  //     	function ( xhr ) {
  //     		console.log( 'An error happened' );
  //         task_count += 1;
  //     	}
  //     );
  //   })(i);
  // }
}

function rand_int(start, end) {
  return Math.floor(Math.random() * (end - start)) + start;
}

function rand_normal(degree) {
  var sign = Math.random() < 0.5? -1 : 1;
  return rnorm() * degree * sign;
}

function init() {
  texture_loader = new THREE.TextureLoader();
  bg_mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 0), new THREE.MeshBasicMaterial());
  bg_mesh.material.depthTest = false;
  bg_mesh.material.depthWrite = false;
  bg_scene = new THREE.Scene();
  bg_camera = new THREE.Camera();
  bg_scene.add(bg_camera);
  bg_scene.add(bg_mesh);

  // light
  alight = new THREE.AmbientLight(0x404015, 4.2);
  dlight = new THREE.DirectionalLight(0xffffff, 0.7);
  dlight.position.set(0, 1, 0);

  // camera
  aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 1, 10000);

  renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvas = renderer.domElement;
  document.body.appendChild(renderer.domElement);
}

function random_background(choices) {
  randint = rand_int(0, choices.length);
  bg = choices[randint];
  var texture = backgrounds[bg];
  bg_mesh.material.map = texture;
  // var texture = texture_loader.load(bg, function ( texture ) {
  //   bg_mesh.material.map = texture;
  //   console.log("texture loaded.");
  //   load_models(available_models);
  // });
}

function point2d_from_vector(vector, camera) {
  var p = vector.clone();
  console.log("p", p);
  p.project(camera);
  console.log("p_mapped", p);
  p.x = Math.round((p.x + 1) * canvas.width / 2 );
  p.y = Math.round((-p.y + 1) * canvas.height / 2 );
  p.z = 0;
  return p;
}

function bbox2d_from_vectors(min, max, camera) {
  var p = point2d_from_vector(min, camera);
}

function calc2Dpoint(v) {

    var projector = new THREE.Projector();
    var vector = projector.projectVector( new THREE.Vector3( v.x, v.y, v.z ), camera );
    console.log('vector', vector, v.x, v.y, v.z);
    var result = new Object();
    // result.x = Math.round(vector.x * (renderer.domElement.width/2));
    // result.y = Math.round(vector.y * (renderer.domElement.height/2));
    result.x = 0;
    result.y = 0;
    return result;

}

function screenXY(obj){

  var vector = obj.clone();
  var windowWidth = window.innerWidth;
  var minWidth = 100;

  if(windowWidth < minWidth) {
    windowWidth = minWidth;
  }

  var widthHalf = (windowWidth/2);
  var heightHalf = (window.innerHeight/2);

  console.log('before', vector.x, vector.y, vector.z);
  vector.project(camera);
  console.log('after', vector.x, vector.y, vector.z);


  vector.x = ( vector.x * widthHalf ) + widthHalf;
  vector.y = - ( vector.y * heightHalf ) + heightHalf;
  vector.z = 0;

  return vector;

};

var to2D = function ( pos ) {

    var projScreenMat = new THREE.Matrix4();
    projScreenMat.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
    projScreenMat.multiplyVector3( pos );

    return {
        x: ( pos.x + 1 ) * renderer.domElement.clientWidth / 2,
        y: ( - pos.y + 1) * renderer.domElement.clientHeight / 2
    };

}

function bbox2d_from_object0(obj) {
  var bbox3d = new THREE.Box3().setFromObject(obj);
  console.log(bbox3d);
  var p = screenXY(bbox3d.min);
  var q = screenXY(bbox3d.max);
  console.log('p', p.x, p.y, 'q', q.x, q.y);
  xmin = Math.min(p.x, q.x);
  ymin = Math.min(p.y, q.y);
  xmax = Math.max(p.x, q.x);
  ymax = Math.max(p.y, q.y);
  return [xmin, ymin, xmax, ymax];
}



function bbox2d_from_object(obj) {
  var helper = new THREE.BoxHelper(obj, 0xff0000);
  helper.update();
  var box3 = new THREE.Box3().setFromObject(helper);
  var x_min = Math.min(box3.min.x, box3.max.x);
  var y_min = Math.min(box3.min.y, box3.max.y);
  var x_max = Math.max(box3.min.x, box3.max.x);
  var y_max = Math.max(box3.min.y, box3.max.y);
  var cx = obj.position.x;
  var cy = obj.position.y;
  // var geometry = obj.children[0].geometry;  // substitute the path to your geometry
  //
  //   geometry.computeBoundingBox();  // otherwise geometry.boundingBox will be undefined
  //
  //   var boundingBox = geometry.boundingBox.clone();
  //   alert('bounding box coordinates: ' +
  //       '(' + boundingBox.min.x + ', ' + boundingBox.min.y + ', ' + boundingBox.min.z + '), ' +
  //       '(' + boundingBox.max.x + ', ' + boundingBox.max.y + ', ' + boundingBox.max.z + ')' );
  return [x_min + cx, y_min + cy, x_max + cx, y_max + cy];
}

function reset_label() {
  label = {};
  label["folder"] = folder;
  label["image_w_h"] = [canvas.width, canvas.height];
  label["objects"] = [];
}

function add_object_to_label(box, name) {
  var obj = {};
  obj["label"] = name;
  obj["x_y_w_h"] = [box[0], box[1], box[2] - box[0], box[3] - box[1]];
  label["objects"].push(obj);
}

function random_scene(names, fname) {
  // aspect = window.innerWidth / window.innerHeight;

  dist = rand_int(100, 300);
  // console.log("camera ", dist);
  camera.position.z = dist;
  // var vfov = camera.fov * Math.PI / 180;
  // console.log('vfoc', vfov, camera.fov);
  // var height = 2 * Math.tan(vfov / 2) * dist;
  // var width = height * aspect;
  // console.log('width ', width, ' height', height);
  scene = new THREE.Scene();
  scene.add(camera);
  reset_label();
  for (var i in names) {
    var name = names[i];
    model_library[name].rotation.x = rand_int(-10, 45) * Math.PI / 180;
    model_library[name].rotation.y = rand_normal(45) * Math.PI / 180;
    model_library[name].rotation.z = rand_int(0, 0) * Math.PI / 180;
    model_library[name].position.x = rand_int(-60, 60);
    model_library[name].position.y = rand_int(-30, 30);
    model_library[name].position.z = 0; //rand_int(-30, 30);
    // var box2d = bbox2d_from_object(model_library[name], camera);
    // console.log(name, box2d);
    var helper = new THREE.BoxHelper(model_library[name], 0xff0000);
    helper.update();
    // var box3 = new THREE.Box3().setFromObject(helper);
    // console.log('box3', box3);
    // var size = new THREE.Vector3();
    // box3.getSize(size);
    // console.log('size', size);
    var bbox = bbox2d_from_object0(model_library[name]);
    console.log(bbox[2] - bbox[0], bbox[3] - bbox[1]);
    add_object_to_label(bbox, name);
    // If you want a visible bounding box
    scene.add(helper);
    // var bbox = bbox2d_from_object()
    // console.log("name", name, model_library, model_library[name], Object.keys(model_library));
    scene.add(model_library[name]);
  }

  // light
  scene.add(alight);
  scene.add(dlight);
}

function save_image(prefix) {
  var fname = prefix + '_' + global_counter + '.jpg';
  global_counter += 1;
  if (global_counter > counter_limit) return;
  var strMime = "image/jpeg";
  var imgData = renderer.domElement.toDataURL(strMime);
  var data = imgData.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, 'base64');
  require('fs').writeFileSync(fname, buf);

  // write label
  basename = path.basename(fname);
  dirname = path.dirname(fname);
  lname = path.join(annotation_foler, path.basename(fname, '.jpg') + '.json');
  label["filename"] = basename;
  label["folder"] = dirname;
  require('fs').writeFileSync(lname, JSON.stringify(label, null, 2), 'utf-8');
}

function random_animate(bgs, models, fname) {
    if (pause) return;
    id = requestAnimationFrame(random_animate);
    // x = rand_int(-100, 100);
    // y = rand_int(-100, 100);
    // z = rand_int(-50, 50);
    // random_background(bgs);
    // random_scene(models, fname);



    // model_library[].rotation.x = x;
    // pikachu.rotation.y = y;
    // pikachu.rotation.z = z;
    // pikachu.position.x += 0.005;
    // pikachu.position.y -= 0.001;

    renderer.autoClear = false;
    renderer.clear();
    renderer.render(bg_scene, bg_camera);
    renderer.render(scene, camera);
    // cancelAnimationFrame( id );
}
