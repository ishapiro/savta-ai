import { writeFileSync } from 'fs'

writeFileSync('./.build-date', new Date().toISOString()) 