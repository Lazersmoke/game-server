model.hitler = {}
model.hitler.fascistCount = 0
model.hitler.liberalCount = 0

addHTML()

model.onPlayerAdd = function(){
  updateFascBoard()
}
model.onmessage = function(e){
  if(e.startsWith("Ask|")){
    question = e.split("|")[1]
    switch (question){
      // "Ask|Vote" -> "Resp|Ja"
      case "Vote":
        //chatLog("\nSERVER: Please cast your vote!")
        model.wakeupTimeout = setTimeout(function(){ alert("You need to vote") },10000)
        statusAlert("You need to vote","If you want the players who are listed in chat and hightlighted in the middle of the screen to become the president (blue) and chancellor (orange), vote Ja (yes), otherwise, vote Nein (no).")
        showVotebox(true) 
        break
      case "Veto":
        //chatLog("\nSERVER: The chancellor has requested a veto! Do you accept?")
        statusAlert("The chancellor has requested a veto! Do you accept?","If you agree to Veto, then no policies will be played this round. This will advance the election tracker, however.")
        showVotebox(true)
        break
      // "Ask|Chancellor" -> "Resp|asdf"
      case "Chancellor":
        //chatLog("\nSERVER: Please select a chancellor!")
        model.wakeupTimeout = setTimeout(function(){alert("You are president")}, 15000)
        statusAlert("You are the president, select a chancellor","Click on a player who you trust to run as chancellor, with you as president. They will decide which of the two policy cards you give them they will play.") 
        model.allowPlayerClick = true
        break
      // "Ask|Discard|Policy Fascist,Policy Liberal,Policy Liberal" -> "Resp|Policy Liberal"
      case "Discard":
        //chatLog("\nSERVER: Choose a card to discard")
        statusAlert("Discard a policy","The other two policies will go to the chancellor, who will pick one to play.")
        cards = e.split("|")[2].split(",")
        showCardbox(true,cards)
        break
      // "Ask|Play|Policy Fascist,Policy Liberal,Policy Liberal" -> "Resp|Policy Fascist"
      case "Play":
        statusAlert("Play a policy","It will go on the game board for whichever side it says on the card.")
        //chatLog("\nSERVER: Choose a card to play")
        cards = e.split("|")[2].split(",")
        showCardbox(true,cards)
        //Hijack the cardbox to display our veto button
        if(model.hitler.fascistCount > 4){
          var vetobutton = document.createElement("button")
          vetobutton.innerHTML = "Veto"
          vetobutton.onclick = function(){
            sock.send("Resp|Veto")
            showCardbox(false,[])
          }
          document.getElementById("cardbox").appendChild(vetobutton)
        }
        break
      case "Kill":
        //chatLog("\nSERVER: Choose a player to execute")
        statusAlert("Choose a player to execute","This player will be permanently removed from the game (because their dead)")
        model.allowPlayerClick = true
        break
      case "Investigate":
        //chatLog("\nSERVER: Choose a player to investigate")
        statusAlert("Choose a player to investigate","You will see what their secret identity is (with 100% certainty)")
        model.allowPlayerClick = true
        break
      case "Kill":
        //chatLog("\nSERVER: Choose a player to elect as president")
        statusAlert("Choose a player to elect as president","You choose the next presidential candidate")
        model.allowPlayerClick = true
        break
      default:
        chatLog("\nWARNING: UNKNOWN API CALL REPORT IT. DO IT NOW:\n" + question)
        statusAlert("\nWARNING: UNKNOWN API CALL REPORT IT. DO IT NOW:\n" + question, "")
        break
    }
  }
  if(e.startsWith("Info|")){
    var sayInChatLog = true
    info = e.split("|")[1]
    switch (info){
      case "A Liberal Policy was played!":
        model.hitler.liberalCount += 1
        setCardcount(model.hitler.liberalCount, model.hitler.fascistCount)
        break
      case "A Fascist Policy was played!":
        model.hitler.fascistCount += 1
        setCardcount(model.hitler.liberalCount, model.hitler.fascistCount)
        break
    }
    if(info.startsWith("The Fascists are ")){
      fascists = info.split(" ").slice(3).join(" ").split("\n")
      fascists.forEach(function(a){
        addPlayer(a, "secret-hitler/fascist" + (Math.floor(Math.random() * 3) + 1) + ".png", true)
      })
      sayInChatLog = false
    }
    if(info.startsWith("The Liberals are ")){
      liberals = info.split(" ").slice(3).join(" ").split("\n")
      liberals.forEach(function(a){
        addPlayer(a, "secret-hitler/liberal" + (Math.floor(Math.random() * 4) + 1) + ".png", true)
      })
      sayInChatLog = false
    }
    if(info.startsWith("You are ")){
      document.getElementById("inputbutton").style.display = "none"
      yourrole = info.split(" ")[2]
      switch(yourrole){
        case "liberal":
          statusAlert("You are a liberal","Your goal is to either pass 5 liberal policies or to kill Hitler")
          addPlayer(model.username,"secret-hitler/liberal" + (Math.floor(Math.random() * 4) + 1) + ".png", true)
          break
        case "fascist":
          statusAlert("You are a fascist","Your goal is to either pass 6 fascist policies or elect Hitler as chancellor after passing 3 fascist policies")
          addPlayer(model.username,"secret-hitler/fascist" + (Math.floor(Math.random() * 3) + 1) + ".png", true)
          break
        case "hitler":
          statusAlert("You are Hitler","Your goal is to either pass 6 fascist policies or get elected chancellor after passing 3 fascist policies")
          addPlayer(model.username,"secret-hitler/hitler.png", true)
          break
      }
      sayInChatLog = false
    }
    if(info.startsWith("Hitler is ")){
      hitler = info.split(" ").slice(2).join(" ")
      addPlayer(hitler,"secret-hitler/hitler.png", true)
      sayInChatLog = false
    }
    if(info.startsWith("The votes were")){
      votes = info.split(": ")[1].split("\n").slice(1).map(s => [s.split(" ")[0],s.split(" ").splice(1).join(" ")])
      votes.forEach(function(a){
        showVote(a[1],a[0])
      })
    }
    if(info.startsWith("The proposed government is: ")){
      proped=info.split("The proposed government is: ")[1].split(" as Chancellor")[0].split(" as President and ")
      $PLAYERLIST$.forEach(function(a){
        document.getElementById(a+"img").className = ""
      })
      document.getElementById(proped[0] + "img").className = "presidentglow"
      document.getElementById(proped[1] + "img").className = "chancellorglow"
    }
    if(info.startsWith("The new government is: ")){
      gov=info.split("The new government is: ")[1].split(" as Chancellor")[0].split(" as President and ")
      statusAlert("The new government is choosing policies","Please wait")
      model.players.forEach(function(a){
        document.getElementById(a+"img").className = ""
      })
      document.getElementById(gov[0] + "img").className = "presidentglow"
      document.getElementById(gov[1] + "img").className = "chancellorglow"
    }
    chatLog("\nSERVER: " + e.split("|")[1])
  }
}
    
function addHTML(){
  var body = document.getElementById("main-body")
    body.style.backgroundImage = "url('secret-hitler/background.png')"

  var votebox = document.createElement("div")
    votebox.id = "votebox"
  var ja_button = document.createElement("img")
    ja_button.id = "JAbutton"
    ja_button.src = "secret-hitler/ja_card.png"
    votebox.appendChild(ja_button)
  var nein_button = document.createElement("img")
    nein_button.id = "NEINbutton"
    nein_button.src = "secret-hitler/nein_card.png"
    votebox.appendChild(nein_button)
  body.appendChild(votebox)

  var cardbox= document.createElement("div")
    cardbox.id = "cardbox"
  body.appendChild(cardbox)

  var gameboarddiv = document.createElement("div")
    gameboarddiv.id = "gameboarddiv"

  var liberalboard = document.createElement("img")
    liberalboard.id = "liberalboard"
    liberalboard.src = "secret-hitler/liberalboard.png"
    liberalboard.className = "gameboard"
    gameboarddiv.appendChild(liberalboard)

  var liberaloverlay = document.createElement("img")
    liberaloverlay.id = "liberaloverlay"
    liberaloverlay.src = "secret-hitler/liberaloverlay0.png"
    liberaloverlay.className = "gameboard"
    gameboarddiv.appendChild(liberaloverlay)

  var fascistboard = document.createElement("img")
    fascistboard.id = "fascistboard"
    fascistboard.src = "secret-hitler/fascistboard5.png"
    fascistboard.className = "gameboard"
    gameboarddiv.appendChild(fascistboard)

  var fascistoverlay = document.createElement("img")
    fascistoverlay.id = "fascistoverlay"
    fascistoverlay.src = "secret-hitler/fascistoverlay0.png"
    fascistoverlay.className = "gameboard"
    gameboarddiv.appendChild(fascistoverlay)

  body.appendChild(gameboarddiv)

  document.getElementById("JAbutton").onclick = function(){sock.send("Resp|Ja");showVotebox(false);clearTimeout(model.wakeupTimeout)}
  document.getElementById("NEINbutton").onclick = function(){sock.send("Resp|Nein");showVotebox(false);clearTimeout(model.wakeupTimeout)}
}

showVotebox(false)
showCardbox(false,[])

function showVotebox(onOff){
  document.getElementById("votebox").style.display = onOff ? 'block' : 'none'
}

function showVote(name, vote){
  image = ""
  switch (vote){
    case "Ja":
      image = "ja_card.png"
      break
    case "Nein":
      image = "nein_card.png"
      break
  }
  var newimage = document.createElement("img")
  newimage.src = "secret-hitler/" + image
  newimage.className = "voteIndicator"
  document.getElementById(name + "div").appendChild(newimage)
  setTimeout(function(){newimage.remove()},5000)
}
function setCardcount(lib,fasc){
 document.getElementById("liberaloverlay").src = "secret-hitler/liberaloverlay" + lib + ".png"
 document.getElementById("fascistoverlay").src = "secret-hitler/fascistoverlay" + fasc+ ".png"
}

function showCardbox(onOff,cardlist){
  document.getElementById("cardbox").innerHTML = '';
  for(i in cardlist){
    newcard = document.createElement("img")
    newcard.value = cardlist[i]
    newcard.src = "secret-hitler/" + cardlist[i].split(" ")[1].toLowerCase()+"policy.png"
    newcard.onclick = function(){
      sock.send("Resp|" + this.value)
      showCardbox(false,[])
    }
    document.getElementById("cardbox").appendChild(newcard)
  }
  document.getElementById("cardbox").style.display = onOff ? 'block' : 'none'
}
function updateFascBoard(){
  switch (model.players.length){
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      document.getElementById("fascistboard").src = "secret-hitler/fascistboard5.png"
      break
    case 7:
    case 8:
      document.getElementById("fascistboard").src = "secret-hitler/fascistboard7.png"
      break
    case 9:
    case 10:
      document.getElementById("fascistboard").src = "secret-hitler/fascistboard9.png"
      break
  }
}
