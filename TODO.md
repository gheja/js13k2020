# js13k2020

## general
- [ ] lock the currently occupied NetworkEdges
- [ ] calculate edge of "roads"
- [ ] preview canvas hidden until needed
- [ ] title screen
- [ ] cinematic mode
- [ ] narration
- [ ] GUI zoom
- [ ] different income for each good type
- [ ] better navigation
- [ ] current tool icon highlight
- [ ] tooltip with mouse
- mouse handling
  - [ ] hover over objects
  - [x] click on objects
  - [x] click and drag land
- navigation
  - [ ] keys
  - [ ] touch
  - [x] mouse
- costs
  - [ ] vehicle purchase
  - [ ] vehicle upkeep
  - [ ] loan interest
  - [x] building
  - [x] destroying
- [x] popup text status (income, etc)
- [x] make NetworkNode clickable
- [x] preview canvas
- [x] clean up unused tool icons
- [x] build preview
- [x] update statuses (credits, date, etc.)
- [x] depot
- [x] station creation
- [x] implement destroy tool
- [x] spend checks
- [x] spend notifications
- [x] highlight objects instead of cursor

## vehicles
- [ ] linked vehicles
- [ ] trains
- [ ] ships
- [ ] upkeep costs
- [ ] create definitions
- [ ] buy
- [ ] sell
- [x] angle calculation
- [x] schedule editor
- [x] make load and unload separate steps

## windows
- [ ] icons/profile "photos" for windows
- [ ] factory?
- [ ] research
- [ ] contracts
- [x] buy
- [x] depot
- [x] update an opened window periodically
- [x] vehicle
- [x] vehicle schedule
- [x] station
- [x] stats
- [x] loans

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
- [ ] better road rendering
- road building
  - [ ] limit angles
  - [ ] highlight invalid section
  - [x] implement
  - [x] highlight correct section

## build
- [ ] advzip
- [ ] further optimization of HTML and CSS

## webgl
- [ ] use [0,0,0] for coordinates (instead of {x: 0, y:0, z:0})
- [x] refer to shapes by index
- [x] load shapes from an array (from data.ts) instead of hardcoding them
- [x] support for same model with different colors
- [x] hide cursor in preview window
- [x] add highlight color scheme

## bugs
- [ ] roads are still lame but better
- [ ] goTowards3D() is buggy
- [ ] vehicle: when removing the active schedule item schedule gets reset
- [ ] vehicle: when schedule is empty, adding one item
- [ ] mouse coordinates are wrong when running inside iframe (itch.io, screen vs client coords?)
- [x] roads are lame
