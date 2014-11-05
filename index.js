'use strict';

var fs      = require('fs'),
    env     = require('node-env-file'),
    request = require('superagent'),
    btoa    = require('btoa')

var args    = process.argv.slice(2)

var baseAPI    = 'https://www.transifex.com/api/2/',
    outputPath = __dirname + '/output/'

var envFile = __dirname + '/.env'
try {
  env(envFile)
} catch (err) {
  // Nothing. If env file not found, move on.
}

if (!process.env.TRANSIFEX_USERNAME || !process.env.TRANSIFEX_PASSWORD) {
  console.error('Transifex authorization credentials are missing.')
  return
}

var token = btoa(process.env.TRANSIFEX_USERNAME + ':' + process.env.TRANSIFEX_PASSWORD)

var languageAPI = baseAPI + 'project/streetmix/languages/'
var resourceSlug = 'main'

// If arguments given, process those instead of all
if (args && args.length > 0) {
  for (var i = 0; i < args.length; i++) {
    getTranslation(args[i])
  }
  return
}

// Get the list of all available languages from Transifex
console.log('Retrieving all languages from Transifex...')

request
  .get(languageAPI)
  .set('Authorization', 'Basic ' + token)
  .end(function (err, res) {
    if (err) {
      console.log(err)
      return
    }
    if (res.error) {
      console.log(res.error)
      return
    }

    var languages = res.body
    // Note: this automatically skips en-US, but you can manually request
    // it in arguments, if you want it.

    if (languages.length === 0) {
      console.log('No languages retrieved.')
      return
    }

    for (var j = 0; j < languages.length; j++) {
      getTranslation(languages[j].language_code)
    }
  })


function getTranslation (locale) {
  var translationAPI = baseAPI + 'project/streetmix/resource/' + resourceSlug + '/translation/' + locale + '/'

  // path for Streetmix front-end
  var localePath = locale.replace(/@|_/, '-')

  request
    .get(translationAPI)
    .set('Authorization', 'Basic ' + token)
    .set('Accept', 'text/xml')
    .end(function (err, res) {
      if (err) {
        console.log(err)
        return
      }
      if (res.error) {
        if (res.error.status === 404) {
          console.log('No translation exists for locale `' + locale + '`.')
        } else {
          console.log(res.error)
        }
        return
      }

      var translation = JSON.parse(res.body.content)

      // Create the directory, skip error if it exists
      try {
        fs.mkdirSync(outputPath + localePath)
      } catch (err) {
        if (err.code !== 'EEXIST') {
          console.log(err)
        }
      }

      // Write translation file
      fs.writeFile(outputPath + localePath + '/translation.json', JSON.stringify(translation, null, 2), function (err) {
        if (err) throw err
        console.log('Retrieved translation file for locale `' + locale + '`.')
      })
    })
}
