let scene, camera, renderer;
let playerMesh, bossMesh, metinMesh;

function startGame() {

  socket = new WebSocket("ws://localhost:5000");

  socket.onmessage = (e) => {

    const data = JSON.parse(e.data);

    if (data.type === "update") {

      document.getElementById("metinHP").innerText =
        "Metin HP: " + data.metin.hp;

      document.getElementById("bossHP").innerText =
        "Boss HP: " + data.boss.hp;

      const player = Object.values(data.players)[0];

      if (player) {
        document.getElementById("stats").innerText =
          "Level: " + player.level +
          " | HP: " + player.hp +
          " | Gold: " + player.gold;
      }

      bossMesh.position.set(data.boss.x, 1, data.boss.z);
    }
  };

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("game")
  });

  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 20, 10);
  scene.add(light);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );

  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );

  playerMesh.position.y = 1;
  scene.add(playerMesh);

  metinMesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );

  metinMesh.position.set(10, 2, 0);
  scene.add(metinMesh);

  bossMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshStandardMaterial({ color: 0xff8800 })
  );

  bossMesh.position.set(20, 1, 20);
  scene.add(bossMesh);

  camera.position.set(0, 12, 20);

  document.addEventListener("keydown", move);

  animate();
}

function move(e) {

  const speed = 0.5;

  if (e.key === "w") playerMesh.position.z -= speed;
  if (e.key === "s") playerMesh.position.z += speed;
  if (e.key === "a") playerMesh.position.x -= speed;
  if (e.key === "d") playerMesh.position.x += speed;

  if (e.key === "1") {
    socket.send(JSON.stringify({ type: "skill" }));
  }

  socket.send(JSON.stringify({
    type: "move",
    x: playerMesh.position.x,
    z: playerMesh.position.z
  }));
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
