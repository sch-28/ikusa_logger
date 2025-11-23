# Ikusa Logger
A tool for Black Desert Online to log combat messages.

https://user-images.githubusercontent.com/42447473/184521641-e66a6bc4-191f-4c60-ae56-5172b052ec09.mp4

Visualize your captured logs with this [website](https://github.com/sch-28/ikusa).
## Prerequisites
```
nodejs libcap python3
```
## Installation
1. Clone the repository
2. Make sure you have the prerequisites installed (Node.js and Python)
4. Run `build.sh`

## Usage
1. Start `ikusa-logger-linux_x64` located in `/dist/ikusa-logger/`
2. Click on the `Record` button
3. After you are done recording, make sure to order the names of the players in the correct order!
The order should be: `Family-Name-1 kills/died to Family-Name-2 from Enemy-Guild`
4. Download the logs by clicking `Save` or upload the logs directly to the website by clicking `Upload`

If you noticed that you have chosen the wrong name order, you can open the `.log` file again with the logger and adjust the names.

https://github.com/sch-28/ikusa_logger/assets/42447473/ebcd67f0-c43a-4d12-b38d-79a7542e92ed

## Startup Issue
If you are unable to start the regular ikusa-logger. Try to start it using the `--mode=browser` argument.

## Need help?
If you have any questions, feel free to add me on Discord: sch.28
