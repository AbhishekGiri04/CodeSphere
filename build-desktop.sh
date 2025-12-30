#!/bin/bash

echo "Building CodeSphere Desktop for Distribution..."
echo "Created by: Abhishek Giri"
echo ""

# Clean and compile
mvn clean compile

if [ $? -eq 0 ]; then
    echo "Compilation successful"
    echo "Creating executable JAR..."
    
    # Create JAR with dependencies
    jar -cvf codesphere-desktop.jar -C target/classes .
    
    echo "JAR created: codesphere-desktop.jar"
    echo ""
    echo "To run: java -cp codesphere-desktop.jar com.codesphere.swing.CodeSphereSwing"
    echo "Or use: ./start-swing.sh"
else
    echo "Build failed"
    exit 1
fi