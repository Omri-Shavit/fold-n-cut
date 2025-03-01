### Main todos
 - [ ] Buttons
	- [ ] Implement the Add Edge button
	- [ ] Implement move vertex button
	- [x] Make the tool Buttons radio. The current equipped tool can be one of the following:
		- Add vertex
		- Move vertex
		- Add edge
		- Potentially more tools
	- [x] Add Tool Tips to buttons
	- [x] Add hotkeys (most if not all on the left hand so the user can use mouse only)
- [ ] Implement `constructStraightSkeleton()`
- [ ] Implement error warnings like the one seen in Oriedita
	-  Top right text reads 0 errors in green if there are none or {n} errors in red if there are {n} errors
	-  Types of errors include:
		- Vertices that don't have degree 2
		- Edges that intersect each other
- [ ] Implement `Fnc.getState()` and `Fnc.setState()` which gets and sets the state

- [ ] When done, deploy to github pages
### Stretch goals
- [ ] 'Animate' feature that creates a downloadable gif or video showing the model being folded, then cut, then unfolded. Something like [this nice gif here](https://en.wikipedia.org/wiki/Fold-and-cut_theorem#/media/File:FoldedKoch.gif)
- [ ] 