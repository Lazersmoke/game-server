model.kittens = {}
model.kittens.fascistCount = 0
model.kittens.liberalCount = 0
model.kittens.hand = []

addHTML()

model.onmessage = function(e){
  if(e.startsWith("Ask|")){
    question = e.split("|")[1]
    switch (question){
      case "Action?":
        statusAlert("Take your turn","Choose the card from your hand you want to play, or draw a card to end your turn.")
        model.kittens.allowCardClick = true
        break
      default:
        chatLog("\nWARNING: UNKNOWN API CALL REPORT IT. DO IT NOW:\n" + question)
        statusAlert("\nWARNING: UNKNOWN API CALL REPORT IT. DO IT NOW:\n" + question, "")
        break
    }
  }
  if(e.startsWith("Info|")){
    info = e.split("|")[1]
    if(info.startsWith("Your hand is: ")){
      var newhand = info.split(" ").slice(3).join(" ").slice(1,-1).split(",")
      model.kittens.hand = newhand
      updateHandBox();
    }
    if(info.startsWith("You Drew: ")){
      var newcard = info.split(" ").slice(2).join("")
      model.kittens.hand.push(newcard)
      updateHandBox();
    }
    if(info.startsWith("You Played: ")){
      var killedCard = info.split(" ").slice(2).join("")
      var killIndex = model.kittens.hand.indexOf(killedCard)
      model.kittens.hand.splice(killIndex, 1)
      updateHandBox();
    }
    chatLog("\nSERVER: " + info)
  }
}
    
function addHTML(){
  var body = document.getElementById("main-body")
    body.style.backgroundImage = "url('exploding-kittens/background.png')"

  var handbox = document.createElement("div")
    handbox.id = "handbox"
  body.appendChild(handbox)

  var drawbutton = document.createElement("button")
    drawbutton.id = "drawbutton"
    drawbutton.innerHTML = "Draw Card"
    drawbutton.onclick = function(){sock.send("Resp|Draw")}
  body.appendChild(drawbutton)
}

updateHandBox()

function updateHandBox(){
  document.getElementById("handbox").innerHTML = '';
  for(i in model.kittens.hand){
    newcard = document.createElement("img")
    newcard.value = model.kittens.hand[i]
    newcard.src = "exploding-kittens/cards/" + model.kittens.hand[i].toLowerCase()+".png"
    newcard.onclick = function(){
      sock.send("Resp|Play" + this.value)
    }
    document.getElementById("handbox").appendChild(newcard)
  }
}

