#!/bin/bash

echo "🖥️  CodeSphere - Desktop Application Startup"
echo "============================================="
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 11+ first."
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    exit 1
fi

echo "☕ Java Version:"
java -version
echo ""

echo "📦 Compiling CodeSphere Desktop Application..."
mvn clean compile -q

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful"
    echo ""
    echo "🚀 Starting CodeSphere Desktop Application..."
    echo "Features: Code Editor + Whiteboard + Real Compiler"
    echo ""
    
    # Run the Swing application directly
    mvn exec:java -Dexec.mainClass="com.codesphere.CodeSphereSwing" -q
else
    echo "❌ Compilation failed"
    exit 1
fi