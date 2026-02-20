let socket = null;

async function login() {

  const usernameValue = document.getElementById("username").value;
  const passwordValue = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: usernameValue,
      password: passwordValue
    })
  });

  if (res.ok) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("ui").style.display = "block";
    startGame();
  }
}

async function register() {

  const usernameValue = document.getElementById("username").value;
  const passwordValue = document.getElementById("password").value;

  await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: usernameValue,
      password: passwordValue
    })
  });
}

function upgradeItem() {
  if (!socket) return;
  socket.send(JSON.stringify({ type: "upgrade", slot: 0 }));
}

function equipItem() {
  if (!socket) return;
  socket.send(JSON.stringify({ type: "equip", slot: 0 }));
}
