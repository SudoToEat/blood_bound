import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist')
const assetsDir = path.join(distDir, 'assets')

assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'Run npm run build before testing built assets')
assert.ok(fs.existsSync(assetsDir), 'Build output is missing dist/assets')

const assetFiles = fs.readdirSync(assetsDir)
const javascript = assetFiles
  .filter((file) => file.endsWith('.js'))
  .map((file) => fs.readFileSync(path.join(assetsDir, file), 'utf8'))
  .join('\n')

assert.equal(
  javascript.includes('/src/assets/'),
  false,
  'Production JavaScript must not reference /src/assets/ paths'
)

function assertHasBuiltAsset(prefix, extensionPattern) {
  assert.ok(
    assetFiles.some((file) => file.startsWith(prefix) && extensionPattern.test(file)),
    `Missing built asset for ${prefix}`
  )
}

assertHasBuiltAsset('reference-card-', /\.jpg$/)

for (let index = 1; index <= 10; index += 1) {
  assertHasBuiltAsset(`character_${index}-`, /\.jpg$/)
}
