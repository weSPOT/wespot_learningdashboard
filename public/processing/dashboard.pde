// Global variables
float radius = 50.0;
int X, Y;
int nX, nY;
int delay = 16;


class Event
{
  float _x,_y;
  var _data;
  var _state;
  Event(x,y,data){
    _x = x;
    _y = y;
    _data = data;
  }
  void update(){

  }
  void draw(){
    ellipse(_x,_y,1,1);
  }

}

var eventsPS = {};

void initDrawing()
{
  
  console.log(events);
  var x = 10;
  var y = 10; 
  for(var userKey in events)
  {
  console.log(userKey);
    var backupY = y;
    for(var i=1;i<=6;i++)
            {
      
      var count = 0;
      events[userKey][i].forEach(function(d){
        eventsPS.push(new Event(x,y,events[userKey][i]));
        
        
        if(count < 5){ count++;x += 10;}
        else {count = 0; y += 30; x = i * 120 + 10;}
        console.log(users[userKey].name);
        console.log(x);
        console.log(y);
        console.log(events[userKey][i].length);
      });
      x = i * 120 + 10;
      y = backupY;
    }
    x = i * 120;
    y = backupY;
    text(users[userKey].name, x, y); 
    
    x = 10;
    y +=120;
  }
}
 PFont font;
// Setup the Processing Canvas
void setup(){
  size( 1000, 1200 );
  strokeWeight( 10 );
  frameRate( 15 );



// The font must be located in the sketch's 

// "data" directory to load successfully

font = loadFont("FFScala.ttf"); 

textFont(font); 

  // Set fill-color to blue
  fill( 0, 121, 184 );
  
  // Set stroke-color white
  stroke(0); 

 initDrawing();
  

}

// Main draw loop
void draw(){
  

  radius = radius + sin( frameCount / 4 );
  
  // Track circle to new destination
  X+=(nX-X)/delay;
  Y+=(nY-Y)/delay;

  eventsPS.forEach(function(d){ d.draw(); })
  
  /*// Fill canvas grey
  background( 100 );
  
  // Set fill-color to blue
  fill( 0, 121, 184 );
  
  // Set stroke-color white
  stroke(255); 
  
  // Draw circle
  ellipse( X, Y, radius, radius );  */                
}


// Set circle's next destination
void mouseMoved(){
  nX = mouseX;
  nY = mouseY;  
}

void mouseClicked(){
   size ( 200, 1200);
   initDrawing();
}