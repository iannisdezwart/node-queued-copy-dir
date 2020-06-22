# QueuedCopyDir

## Installation

```sh
$ npm install --save queued-copy-dir
```

## Usage

```js
import * as qcd from 'queued-copy-dir'

/*

	Synchronous

*/

try {
	qcd.sync('/source/directory/name', '/destination/directory/name')

	console.log('QCD successfully finished!')
} catch(err) {
	console.log('QCD threw an error...')
	console.error(err)
}

/*

	With promises

*/

qcd.async('/src/dir/name', 'dest/dir/name')
	.then(() => {
		console.log('QCD successfully finished!')
	})
	.catch(err => {
		console.log('QCD threw an error...')
		console.error(err)
	})

/*

	With async/await

*/

try {
	await qcd.async('/src/dir/name', 'dest/dir/name')

	console.log('QCD successfully finished!')
} catch(err) {
	console.log('QCD threw an error...')
	console.error(err)
}
```