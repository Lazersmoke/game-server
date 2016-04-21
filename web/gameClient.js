model = {};
model.players = []
model.onmessage = function(){}
model.onPlayerAdd = function(){}
model.defaultPlayer = "secret-hitler/player.png"
model.allowPlayerClick = false
gameTypes = ["ExplodingKittens","SecretHitler"]

sock = new WebSocket("ws://potatobox.no-ip.info:9160")
sock.onopen = function(e){
  document.getElementById("inputbutton").disabled = ''
  chatLog("\nConnected to Master Server")
}
sock.onclose = function(e){
  document.getElementById("inputbutton").disabled = 'disabled'
  showConnected(false)
}
sock.onmessage = function(e){
  //Server accepted our username, show connected, hide join
  console.log(e.data)
  if(e.data.startsWith("Welcome, ")){
    document.getElementById("inputbox").style.display = "none"
    document.getElementById("inputbutton").style.display = "none"
    model.username = e.data.split(" ").splice(1).join(" ")
  }
  if(e.data.startsWith("Stop|")){
    var reason = e.data.split("|").splice(1).join(" ")
    alert(reason)
    setTimeout(function(){location.reload()}, 5000)
  }
  if(e.data.startsWith("Shards: ")){
    if(model.lastShards == e.data){return;}
    model.lastShards = e.data
    var shardSelect = document.getElementById("shardselect")
    //Get all shard options
    shardList = processShards(e.data)
    shardSelect.options.length = 0
    //Add each shard option
    shardList.forEach(function(a){
      var option = document.createElement("option")
      option.text = a[0] + " (" + a[1] + ")"
      option.value = a[0]//Sent to server
      shardSelect.add(option)
    })
    //Add New Shard option
    gameTypes.forEach(function(a){
      var newoption = document.createElement("option")
      newoption.text = "New " + a
      newoption.value = "New|" + a//Sent to server
      shardSelect.add(newoption)
    })
    //Display the shard selector
    document.getElementById("sharddiv").style.display = 'block'
  }
  if(e.data.startsWith("Connected to: ")){
    model.servername = e.data.split(": ")[1]
    showConnected(true)
    document.getElementById("chatsubmit").disabled = ''
    document.getElementById("sharddiv").style.display = 'none'

    document.getElementById("inputbutton").style.display = "block"
    document.getElementById("inputbutton").innerHTML = "Ready"
    readyf(false)
    document.getElementById("inputbutton").onclick = function(){readyf(true)}
  }
  if(e.data.startsWith("Chat|")){
    var user = e.data.split("|")[1]
    var message = e.data.split("|")[2]
    chatLog("\n" + "<" + user + "> " + message)
  }
  if(e.data.startsWith("Join|")){
    newuser = e.data.split("|")[1]
    chatLog("\nSERVER: Player \"" + newuser + "\" has joined!") 
    addPlayer(newuser)
  }
  if(e.data.startsWith("Disconnect|")){
    leftuser = e.data.split("|")[1]
    chatLog("\nSERVER: Player \"" + leftuser + "\" has disconnected!") 
    removePlayer(leftuser)
  }
  model.onmessage(e.data)
}

function processShards(data){
  return data.split("\n").slice(1).map(function(e){return e.split(": ")})
}
function addPlayer(name, filename, change = false){
  filename = filename || model.defaultPlayer
  var pb = document.getElementById("playerbox")

  var olddiv = document.getElementById(name + "div")
  var newdiv = document.createElement("div")
  newdiv.style.float = "left"
  newdiv.className = "playerDiv"

  var newplayer = document.createElement("img")
  newplayer.onclick = function(){
    if(model.allowPlayerClick){
      model.allowPlayerClick=false
      sock.send("Resp|" + this.id.slice(0,-3))
      clearTimeout(model.wakeupTimeout)
    }
  }
  newplayer.id = name+"img"
  newplayer.src = filename
  newplayer.width = "150"
  newplayer.height = "200"

  var newtext = document.createElement("p")
  newtext.id = name + "text"
  newtext.innerHTML = name
  newtext.className = "playerText"
  
  newdiv.appendChild(newplayer)
  newdiv.appendChild(newtext)

  if(change){
    pb.replaceChild(newdiv, olddiv)
    newdiv.id=name+"div"
    return
  }
  model.onPlayerAdd()
  model.players.push(name)
  pb.appendChild(newdiv)
  newdiv.id=name+"div"
}
function removePlayer(name){
  model.players.splice(model.players.indexOf(name),1)
  updateFascBoard()
  document.getElementById(name + "div").remove()
}
function showConnected(onOff){
  document.getElementById("connectiontext").innerHTML = onOff ? 'On shard ' + model.servername + ' as ' + model.username : ''
  document.getElementById("connectionindicator").src = onOff ? "connected.png" : "disconnected.png"
}
function chatLog(message){
  chatbox = document.getElementById("chatbox")
  chatbox.innerHTML += message
  chatbox.scrollTop = chatbox.scrollHeight;
}
document.getElementById("inputbutton").onclick = function(){
  sock.send("Hi! I am " + document.getElementById("inputbox").value)
}
document.getElementById("inputbox").onkeydown = function(e){
  if (e.keyCode == 13){
    document.getElementById('inputbutton').click()
  }
}
function readyf(q){
  document.getElementById("inputbutton").className = q ? "readybuttongreen" : "readybuttonred"
  document.getElementById("inputbutton").onclick = q ? function(){readyf(false)} : function(){readyf(true)}
  console.log("sending " + q ? "ready" : "unready")
  sock.send(q ? "ready" : "unready")
}
document.getElementById("sharddiv").style.display = 'none'
document.getElementById("shardsubmit").onclick = function(){
  var sel = document.getElementById("shardselect")
  sock.send(sel.value)
  if(sel.value == "New|SecretHitler" || sel.options[sel.selectedIndex].text.split(" ").slice(-1)[0] == "SecretHitler)"){
    var loaded = document.createElement("script")
    loaded.src = "secret-hitler/secretHitler.js"
    document.getElementById("script-loader").appendChild(loaded)
  }
  if(sel.value == "New|ExplodingKittens" || sel.options[sel.selectedIndex].text.split(" ").slice(-1)[0] == "ExplodingKittens)"){
    var loaded = document.createElement("script")
    loaded.src = "exploding-kittens/explodingKittens.js"
    document.getElementById("script-loader").appendChild(loaded)
  }
}
document.getElementById("chatsubmit").onclick = function(){
  sock.send("Chat|" + model.username + "|" + document.getElementById("chatinput").value)
  document.getElementById("chatinput").value = ""
}
document.getElementById("chatinput").onkeydown = function(e){
  if (e.keyCode == 13){
    document.getElementById('chatsubmit').click()
  }
}

window.onbeforeunload = function(){sock.close()}
showConnected(false)
document.getElementById("inputbutton").className = "joinbutton"
document.getElementById("chatsubmit").disabled = 'disabled'
function statusAlert(shortM, longM){
  document.getElementById("statusbar").innerHTML = shortM
  document.getElementById("statusbarlong").innerHTML = longM
}
document.getElementById("statusbar").onmouseenter = function(){
  document.getElementById("statusbox").style.display = "block"
}
document.getElementById("statusbar").onmouseleave = function(){
  document.getElementById("statusbox").style.display = "none"
}
document.getElementById("connectionindicator").onmouseenter = function(){
  document.getElementById("connectiontext").style.display = "block"
}
document.getElementById("connectionindicator").onmouseleave = function(){
  document.getElementById("connectiontext").style.display = "none"
}
document.getElementById("connectiontext").style.display = "none"
document.getElementById("statusbox").style.display = "none"

