const inflection = require('inflection')

const DEPENDENCY = 'dependency'

const pluralizeDependency = (number) => {
  return inflection.inflect(DEPENDENCY, number)
}

const conjugateToBe = (number) => {
  return inflection.inflect(null, number, 'is', 'are')
}


const formatDependency = (dependency) => {
  const [name, repository] = dependency
  return `${name}@${repository}`
}

const checkDependencies = (packageFile, shouldLog = false, logger = console) => {
  const { dependencies = {}, name, version } = require(packageFile)
  const requiredDependencies = Object.entries(dependencies)
  const nameVer = `${name} v${version}`

  if (shouldLog) {
    const required = requiredDependencies.length
    const checking = `Checking ${required} ${pluralizeDependency(required)} for ${nameVer}.`
    logger.info(checking)
  }

  const missingDependencies = requiredDependencies.filter(([dependency, repository]) => {
    let isMissing = false
    try {
      require.resolve(dependency)
    } catch (_) {
      isMissing = true
    }

    if (shouldLog) {
      const missingWord = isMissing ? 'Missing' : 'Found'
      const pipe = isMissing ? logger.error : logger.info
      const dependencyName = `${formatDependency([dependency, repository])}`
      const missingMessage = `${missingWord} ${DEPENDENCY}: ${dependencyName}.`
      pipe(missingMessage)
    }

    return isMissing
  })


  const missingCount = missingDependencies.length
  const missingNoun = pluralizeDependency(missingCount)
  const missing = `${missingCount} ${missingNoun}`
  if (missingCount) {
    const errorMessage = `${nameVer} could not initialize because ${missing} ${
      conjugateToBe(missingCount)
      } not installed:
    ${missingDependencies.map(formatDependency).join("\n")}.`
    if (shouldLog) {
      logger.error(errorMessage)
    }

    throw new Error(errorMessage)
  }
}

module.exports = checkDependencies