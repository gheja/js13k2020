# js13k2020

## general
- mouse handling
  - [ ] hover over objects
  - [x] click on objects
  - [x] click and drag land
- [x] popup text status (income, etc)
- [ ] lock the currently occupied NetworkEdges
- [x] make NetworkNode clickable
- [ ] calculate edge of "roads"
- [x] preview canvas
- [ ] preview canvas hidden until needed
- [ ] title screen
- [ ] cinematic mode
- [ ] narration
- [ ] GUI zoom
- navigation
  - [x] mouse
  - [ ] keys
  - [ ] touch
- [x] clean up unused tool icons
- [ ] current tool icon highlight
- [x] build preview
- [x] update statuses (credits, date, etc.)
- [x] depot
- [x] station creation
- [x] implement destroy tool
- costs
  - [x] building
  - [x] destroying
  - [ ] vehicle purchase
  - [ ] vehicle upkeep
  - [ ] loan interest
- [x] spend checks
- [x] spend notifications
- [x] highlight objects instead of cursor
- [ ] different income for each good type

## vehicles
- [x] angle calculation
- [x] schedule editor
- [ ] linked vehicles
- [ ] trains
- [ ] ships
- [ ] upkeep costs
- [x] make load and unload separate steps
- [ ] create definitions
- [ ] buy
- [ ] sell

## windows
- [x] update an opened window periodically
- [x] vehicle
- [x] vehicle schedule
- [x] station
- [ ] factory?
- [ ] depot
- [x] stats
- [ ] research
- [x] loans
- [ ] contracts
- [ ] buy

## contracts

## stats
- [ ] total distance travelled
- [x] total goods picked up
- [x] total people transported
- [x] total goods transported (incl. people?)
- [x] total income

## achievements
based on stats

## map
- [ ] some kind of generator
- object types
  - [ ] tree
  - [ ] rock
  - [ ] village
  - [ ] city
  - [ ] water
- [ ] demo place initialization

## network
- road building
  - [x] implement
  - [ ] limit angles
  - [x] highlight correct section
  - [ ] highlight invalid section

## build
- [ ] advzip
- [ ] further optimization of HTML and CSS

## webgl
- [x] refer to shapes by index
- [x] load shapes from an array (from data.ts) instead of hardcoding them
- [x] support for same model with different colors
- [ ] use [0,0,0] for coordinates (instead of {x: 0, y:0, z:0})
- [x] hide cursor in preview window
- [x] add highlight color scheme

## bugs
- [x] roads are lame
- [ ] roads are still lame but better
- [ ] goTowards3D() is buggy
- [ ] vehicle: when removing the active schedule item schedule gets reset
- [ ] vehicle: when schedule is empty, adding one item
