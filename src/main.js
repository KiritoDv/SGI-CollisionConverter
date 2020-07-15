const fs = require("fs");

const path = ""

const meterSize = 230;
const scale = 1;

var obj = fs.readFileSync("C:/Users/Ruine/3D Objects/sm64uv/boo pipe.obj", 'utf-8').split("\n");

var vertex = obj.filter((line) => line.startsWith("v "));
var vertexPositions = obj.filter((line) => line.startsWith("f "));

var vPointsList = [];
var vPosList = [];
var exportType = 'sm64';
var writeText = "";

vertex.forEach(vPos => {
    var formatted = vPos.substring(2).trim().split(" ");
    var vX = formatted[0];
    var vY = formatted[1];
    var vZ = formatted[2];        
    switch(exportType){
        case 'sm64': {
            vPointsList.push([Math.round((meterSize * vX) * scale), Math.round((meterSize * vY) * scale), Math.round((meterSize * vZ) * scale)]);
            break;
        }
        case 'p5js': {
            vPointsList.push(`[${Math.round((meterSize * vX) * scale)}, ${Math.round((meterSize * vY) * scale)}, ${Math.round((meterSize * vZ) * scale)}]`);
            break;
        }
    }      
})

vertexPositions.reverse().forEach(vPos => {
    var formatted = vPos.substring(2).trim().split(" ");
    var vX = formatted[0];
    var vY = formatted[1];
    var vZ = formatted[2]; 
    switch(exportType){
        case 'sm64': {
            vPosList.push([vX - 1, vY - 1, vZ - 1]);
            break;
        }
        case 'p5js': {
            vPosList.push(`[${vX - 1}, ${vY - 1}, ${vZ - 1}]`);
            break;
        }
    }    
})

var vVertexPosConverted = [];
var vFacesConverted = [];

if(exportType == "sm64"){
    vPointsList.forEach(vp => {
        vVertexPosConverted.push(`COL_VERTEX(${vp[0]}, ${vp[1]}, ${vp[2]}),`)
    })

    vPosList.forEach(vp => {
        vFacesConverted.push(`COL_TRI(${vp[0]}, ${vp[1]}, ${vp[2]}),`)
    })
}

switch(exportType){
    case 'sm64': {
        var vMario64Collision = [];

        vMario64Collision.push("COL_INIT(),")
        vMario64Collision.push(`COL_VERTEX_INIT(0x${vVertexPosConverted.length.toString(16)}),`)

        vVertexPosConverted.forEach((vPos => vMario64Collision.push(vPos)))

        vMario64Collision.push(`COL_TRI_INIT(SURFACE_WALL_MISC, ${vFacesConverted.length}),`)
        vFacesConverted.forEach((vPos => vMario64Collision.push(vPos)))
        vMario64Collision.push("COL_TRI_STOP(),")
        vMario64Collision.push("COL_END(),")
        writeText = vMario64Collision.join("\n")
        break;
    }
    case 'p5js': {
        var vP5jsCollision = [];

        vP5jsCollision.push(`var points = [${vPointsList}];`);
        vP5jsCollision.push(" ");
        vP5jsCollision.push(`var triangles = [${vPosList}];`);

        writeText = vP5jsCollision.join("\n")
        break;
    }
}

fs.writeFile('./converted/collision-'+exportType+'.inc.c', writeText, function (err) {
    if (err) return console.log(err);
    console.log('File succefully converted');
});