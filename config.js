import fse from 'fs-extra'

let json
json ?? (json = JSON.parse(await fse.readFile(new URL('./config.json', import.meta.url))))

export default json
