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
        model.kittens.allowDrawClick = true
        break
      case "Combo Target":
      case "Favor Target":
        statusAlert("Choose a player to steal a card from", "They will choose a card to give to you")
        model.allowPlayerClick = true
        break
      case "Favor Card":
        statusAlert("Choose a card to give up", "The player that played the Favor Card will get this card from you")
        model.kittens.cardAlert = function(){statusAlert("Wait for others to take their turn","Please wait!")}
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
      var newhand = info.split(": ").slice(1).join("").slice(1,-1).split(",")
      model.kittens.hand = newhand
      updateHandBox();
    }
    if(info.startsWith("You Drew: ")){
      var newcard = info.split(": ").slice(1).join("")
      model.kittens.hand.push(newcard)
      updateHandBox();
    }
    if(info.startsWith("You Played: ")){
      var killedCard = info.split(": ").slice(1).join("")
      var killIndex = model.kittens.hand.indexOf(killedCard)
      model.kittens.hand.splice(killIndex, 1)
      updateHandBox();
    }
    if(info.startsWith("You Lost: ")){
      var killedCard = info.split(": ").slice(1).join("")
      var killIndex = model.kittens.hand.indexOf(killedCard)
      model.kittens.hand.splice(killIndex, 1)
      updateHandBox();
    }
    if(info.startsWith("You Got: ")){
      var gotCard = info.split(": ").slice(1).join("")
      model.kittens.hand.push(gotCard)
      updateHandBox();
    }
    if(info.startsWith("Your turn has ended")){
      statusAlert("Wait for others to take their turn","Please wait!")
      model.kittens.allowCardClick = false
      model.kittens.allowDrawClick = false
    }
    if(info.startsWith("Your turn has begun")){
      statusAlert("Take your turn","Choose the card from your hand you want to play, or draw a card to end your turn.")
      model.kittens.allowCardClick = false
      model.kittens.allowDrawClick = false
    }
    chatLog("\nSERVER: " + info)
  }
}
    
function addHTML(){
  var body = document.getElementById("main-body")
    body.style.backgroundImage = "url('exploding-kittens/background.png')"

  var handbox = document.createElement("div")
    handbox.id = "handbox"
    handbox.style.zIndex = 10
  body.appendChild(handbox)

  document.getElementById("playerbox").style.zIndex = -100

  var drawbutton = document.createElement("button")
    drawbutton.id = "drawbutton"
    drawbutton.innerHTML = "Draw Card"
    drawbutton.onclick = function(){
      if(model.kittens.allowDrawClick){
        sock.send("Resp|Draw")
        model.kittens.allowDrawClick = false
        model.kittens.allowCardClick = false
      }
    }
  body.appendChild(drawbutton)
}

updateHandBox()

function updateHandBox(){
  document.getElementById("handbox").innerHTML = '';
  for(i in model.kittens.hand){
    newcard = document.createElement("button")
    newcard.value = model.kittens.hand[i]
    newcard.innerHTML = "exploding-kittens/cards/" + model.kittens.hand[i].toLowerCase()+".png"
    newcard.onclick = function(){
      if(model.kittens.allowCardClick){
        sock.send("Resp|Play" + this.value)
        model.kittens.allowDrawClick = false
        model.kittens.allowCardClick = false
        model.kittens.cardAlert()
        model.kittens.cardAlert = function(){}
      }
    }
    document.getElementById("handbox").appendChild(newcard)
  }
}

