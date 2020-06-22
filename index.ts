/*

	===== Info about this file =====

	" This is the main typescript file for Queued Copy Dir.

	- Package name: queued-copy-dir
	- Author: Iannis de Zwart (https://github.com/iannisdezwart)



	===== Table of contents =====

	1. (private function) Add Dir to Queue

	2. (exported function) qcd.sync

	3. (exported function) qcd.async

*/

import { resolve as resolvePath } from 'path'
import * as fs from 'fs'
import { promisify } from 'util'

interface CopyQueueItem {
	relativeFilePath: string
	type: 'dir' | 'file'
}

const fsExists = promisify(fs.exists)
const fsMkdir = promisify(fs.mkdir)
const fsCopyFile = promisify(fs.copyFile)

/* ===================
	1. (private function) Add Dir to Queue
=================== */

const addDirToQueue = (dirPath: string, root: string, queue: CopyQueueItem[]) => {
	const files = fs.readdirSync(dirPath + '/' + root)
	
	for (let file of files) {
		// Parse paths

		const relativeFilePath = root + file + '/'
		const absoluteFilePath = resolvePath(dirPath + '/' + relativeFilePath)
		const stats = fs.statSync(absoluteFilePath)

		if (stats.isDirectory()) {
			// Add dir to queue

			queue.push({
				relativeFilePath,
				type: 'dir'
			})

			// Add children of dir to queue

			addDirToQueue(dirPath, relativeFilePath, queue)
		} else {
			// Add file to queue

			queue.push({
				relativeFilePath,
				type: 'file'
			})
		}
	}
}

/* ===================
	2. (exported function) qcd.sync
=================== */

export const sync = (sourceDirPath: string, destinationDirPath: string) => {
	if (!fs.existsSync(sourceDirPath)) {
		throw new Error(`QueuedCopyDir failed because source directory (${ sourceDirPath }) does not exist.`)
	}

	const queue: CopyQueueItem[] = []

	// Fill the queue

	addDirToQueue(sourceDirPath, '', queue)

	// Create the destination dir if necessary

	if (!fs.existsSync(destinationDirPath)) {
		fs.mkdirSync(destinationDirPath)
	}

	// Traverse queue

	while (queue.length > 0) {
		// Shift queue

		const item = queue.shift()
		const destinationPath = resolvePath(destinationDirPath + '/' + item.relativeFilePath)

		if (item.type == 'dir') {
			// Create dir

			fs.mkdirSync(destinationPath)
		} else {
			// Copy file

			const sourcePath = resolvePath(sourceDirPath + '/' + item.relativeFilePath)

			fs.copyFileSync(sourcePath, destinationPath)
		}
	}
}

/* ===================
	3. (exported function) qcd.async
=================== */

export const async = async (sourceDirPath: string, destinationDirPath: string) => {
	if (!fs.existsSync(sourceDirPath)) {
		throw new Error(`QueuedCopyDir failed because source directory (${ sourceDirPath }) does not exist.`)
	}

	const queue: CopyQueueItem[] = []

	// Fill the queue

	addDirToQueue(sourceDirPath, '', queue)

	// Create the destination dir if necessary

	const exists = await fsExists(destinationDirPath)

	if (!exists) {
		await fsMkdir(destinationDirPath)
	}

	// Traverse queue

	while (queue.length > 0) {
		// Shift queue

		const item = queue.shift()
		const destinationPath = resolvePath(destinationDirPath + '/' + item.relativeFilePath)

		if (item.type == 'dir') {
			// Create dir

			await fsMkdir(destinationPath)
		} else {
			// Copy file

			const sourcePath = resolvePath(sourceDirPath + '/' + item.relativeFilePath)

			await fsCopyFile(sourcePath, destinationPath)
		}
	}
}