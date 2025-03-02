class Camera{
    constructor(){
        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,-100]);
        this.up=new Vector3([0,1,0]);
    }

    moveForward() {
        var f = new Vector3();
        f.set(this.at);  // Set f to be equal to at
        f.sub(this.eye); // Subtract eye from f
        f.normalize();   // Normalize f

        f.mul(1);        // Move by 1 unit

        this.eye.add(f); // Add f to eye
        this.at.add(f);  // Add f to at
    }

    // Move backward by 1 unit
    moveBackwards() {
        var f = new Vector3();
        f.set(this.at);  // Set f to be equal to at
        f.sub(this.eye); // Subtract eye from f
        f.normalize();   // Normalize f

        f.mul(1);        // Move by 1 unit

        this.eye.sub(f); // Subtract f from eye
        this.at.sub(f);  // Subtract f from at
    }

    // Move left by 1 unit
    moveLeft() {
        var f = new Vector3();
        f.set(this.at);  // Set f to be equal to at
        f.sub(this.eye); // Subtract eye from f
        f.normalize();   // Normalize f

        var s = Vector3.cross(this.up, f); // Compute side vector s = up x f
        s.normalize(); // Normalize s

        s.mul(1);      // Move by 1 unit

        this.eye.add(s); // Add s to eye
        this.at.add(s);  // Add s to at
    }

    // Move right by 1 unit
    moveRight() {
        var f = new Vector3();
        f.set(this.at);  // Set f to be equal to at
        f.sub(this.eye); // Subtract eye from f
        f.normalize();   // Normalize f

        var s = Vector3.cross(f, this.up); // Compute the opposite side vector s = f x up
        s.normalize(); // Normalize s

        s.mul(1);      // Move by 1 unit

        this.eye.add(s); // Add s to eye
        this.at.add(s);  // Add s to at
    }

    panLeft() {
        var f = new Vector3();
        f.set(this.at);  // Set f to be equal to at
        f.sub(this.eye); // Subtract eye from f

        var rotationMatrix = new Matrix4();  // Create a rotation matrix
        var alpha = 15;  // Fixed angle of 15 degrees
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        var f_prime = rotationMatrix.multiplyVector3(f); // Rotate f by alpha around up

        // Update the "at" vector
        this.at.set(this.eye); // Set at to be equal to eye
        this.at.add(f_prime);  // Add f_prime to eye to get the new "at"
    }

    // Pan right by rotating -15 degrees around the up vector
    panRight() {
        var f = new Vector3();
        f.set(this.at);  // Set f to be equal to at
        f.sub(this.eye); // Subtract eye from f

        var rotationMatrix = new Matrix4();  // Create a rotation matrix
        var alpha = -15;  // Fixed angle of -15 degrees (opposite of panLeft)
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        var f_prime = rotationMatrix.multiplyVector3(f); // Rotate f by alpha around up

        // Update the "at" vector
        this.at.set(this.eye); // Set at to be equal to eye
        this.at.add(f_prime);  // Add f_prime to eye to get the new "at"
    }

    // Move camera up
    moveUp() {
        let upVector = new Vector3([0, 1, 0]); // Move along Y-axis
        this.eye.add(upVector);
        this.at.add(upVector);
    }

    moveDown() {
        let downVector = new Vector3([0, -1, 0]); // Move along Y-axis
        this.eye.add(downVector);
        this.at.add(downVector);
    }

    lr(angle) {
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle * 180 / Math.PI, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let forward = new Vector3();
        forward.set(this.at);
        forward.sub(this.eye);
        forward = rotationMatrix.multiplyVector3(forward);
        this.at.set(this.eye);
        this.at.add(forward);
    }

    ud(angle) {
        let forward = new Vector3();
        forward.set(this.at);
        forward.sub(this.eye);
        let right = Vector3.cross(forward, this.up);
        right.normalize();
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle * 180 / Math.PI, right.elements[0], right.elements[1], right.elements[2]);
        forward = rotationMatrix.multiplyVector3(forward);
        this.at.set(this.eye);
        this.at.add(forward);
    }
}