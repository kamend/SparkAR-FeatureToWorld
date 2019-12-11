/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// R Programming - https://fb.me/spark-R-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//==============================================================================

// How to load in modules
const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const FaceTracker = require('FaceTracker')
const Patches = require('Patches')
const R = require('Reactive')

const faceTrackerRot = Patches.getVectorValue('FaceTrackerRotation')
const faceTrackerPosition = Patches.getVectorValue("FaceTrackerPosition")
const featurePosition = Patches.getVectorValue('FeatureLocalPosition')

// Apply the face tracker rotation to the feature point
// note: face tracker rotation is in degrees
let rotatedPoint = rotate(getRadians(faceTrackerRot.x),getRadians(faceTrackerRot.y),getRadians(faceTrackerRot.z), featurePosition)

// To get the actual world position, we need to add the rotated point to the Face Tracker world Position
let featureWorldPosition = R.add(faceTrackerPosition, rotatedPoint)

// cube must be parented to the Camera (not inside the Focal Distance)
//let cube = Scene.root.find('cube')

//cube.transform.x = featureWorldPosition.x
//cube.transform.y = featureWorldPosition.y
//cube.transform.z = featureWorldPosition.z

function getRadians(degrees) {
  return R.mul(degrees, R.div(Math.PI, 180))
}

/*
This function will rotate a point with euler rotation (x,y,z) around origin (0,0,0), rotation is in radians
*/

function rotate(xRadians,yRadians,zRadians, point) {

    var cosa = R.cos(zRadians);
    var sina = R.sin(zRadians);

    var cosb = R.cos(yRadians);
    var sinb = R.sin(yRadians);

    var cosc = R.cos(xRadians);
    var sinc = R.sin(xRadians);

    var Axx = R.mul(cosa,cosb);
    var Axy = R.sub(R.mul(R.mul(cosa,sinb),sinc),R.mul(sina,cosc));
    var Axz = R.add(R.mul(cosa,R.mul(sinb,cosc)),R.mul(sina,sinc));

    var Ayx = R.mul(sina,cosb);
    var Ayy = R.add(R.mul(R.mul(sina,sinb),sinc),R.mul(cosa,cosc))
    var Ayz = R.sub(R.mul(R.mul(sina,sinb),cosc),R.mul(cosa,sinc));

    var Azx = R.mul(sinb,-1);
    var Azy = R.mul(cosb,sinc);
    var Azz = R.mul(cosb,cosc);

    return R.vector(
        R.add(R.add(R.mul(Axx, point.x), R.mul(Axy, point.y)), R.mul(Axz, point.z)),
        R.add(R.add(R.mul(Ayx, point.x), R.mul(Ayy, point.y)), R.mul(Ayz, point.z)),
        R.add(R.add(R.mul(Azx, point.x), R.mul(Azy, point.y)), R.mul(Azz, point.z))
      )
}

function getNormal(eulerRotation) {
  var Pitch = getRadians(eulerRotation.x)
  var Yaw = getRadians(eulerRotation.y)
  var Roll = getRadians(eulerRotation.z)
    
  var hv_x = R.cos(Pitch).mul(R.cos(Roll)).mul(R.sin(Yaw)).add(R.sin(Pitch).mul(R.sin(Roll)));
  var hv_y = R.cos(Roll).neg().mul(R.sin(Pitch)).add(R.cos(Pitch).mul(R.sin(Yaw)).mul(R.sin(Roll)));
  var hv_z = R.cos(Pitch).mul(R.cos(Yaw));

  return R.vector(hv_x, hv_y, hv_z).normalize()
}
