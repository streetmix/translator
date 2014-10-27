translator
==========

Script to retrieve Transifex translation files and convert to i18n

Clone this repository locally and run node script to download and save all translation files from Transifex API.

    npm start

To retrieve only specific locales you can specify any number of them in the command line.

    npm start de en-US en-pirate

You will need to provide Transifex authentication credentials under environment variables `TRANSIFEX_USERNAME` and `TRANSIFEX_PASSWORD`. You can provide them in an optional `.env` file (just like main Streetmix codebase) if you do not want to set your `bash_profile` or provide them on the command line.

TODO
* Figure out how to rename keys from Transifex to match expected values of `data-i18n` attribute on the front end
* Figure out how to format the files correctly
