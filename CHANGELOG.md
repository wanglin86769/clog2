# Changelog

### v2.0

#### v2.1.2

- Update some dependencies on frontend to remove vulnerabilities
- Update some dependencies on backend to remove vulnerabilities
- Replace "localhost" in MongoDB URL which does not work in Node.js 18 with "127.0.0.1"

#### v2.1.1

- In order to provide image left/right navigation function, Replaced PrimeVue "Image" component with Element Plus "el-image" component on LogDetail page, which is shared by Xiaokang Sun from HALF project.

#### v2.1.0

- Significant change: move attachment storage from MongoDB to file system due to 16MB limitation and performance issue
- Added attachment icons for word, excel, powerpoint and mp4 files
- Fixed the issue that logs cannot be edited when attachments is empty
- Fixed the issue that image toolbar is hidden behind large image in preview mode
- Removed the history author expansion part for findLogs() since it seriously affect the performance

#### v2.0.5

- Add logbook admin function
- Truncate log description at 50 characters on logbook page
- Sort logs by createdAt instead of updatedAt

#### v2.0.4

- Fixed the issue that log data appends to inactive logs
- Adjusted locale for zh
- Fixed the datatable index issue
- Fixed the '$facet exceeds the limit of 104857600 bytes' issue

#### v2.0.3

- Added API token append for attachments

#### v2.0.2

- Added API token generation dialog and log append function

#### v2.0.1

- Updates versions of Node.js, Vue.js and PrimeVue

#### v2.0.0

**Initial version:**

- Upgrades Clog from v1.0 to v2.0
- Replaces technical sulution from JavaEE/MySQL to Vue.js/Node.js/MongoDB