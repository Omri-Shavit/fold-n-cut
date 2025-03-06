### Main todos
 - [x] Buttons
	- [x] Implement the Add Edge button
	- [x] Implement move vertex button
	- [x] Make the tool Buttons radio. The current equipped tool can be one of the following:
		- Add vertex
		- Move vertex
		- Add edge
		- Potentially more tools
	- [x] Add Tool Tips to buttons
	- [x] Add hotkeys (most if not all on the left hand so the user can use mouse only)
	- [x] Undo / Redo
- [x] Implement error warnings like the one seen in Oriedita
	-  Top right text reads 0 errors in green OR {n} errors in red (if there are n>0 errors)
	-  Types of errors include:
		- Vertices that don't have degree 2
		- Edges that intersect each other
- [ ] Implement `constructStraightSkeleton()`

- [ ] When done, deploy to github pages

### Mo' features
To prevent feature creep, this section is listing Ideas for more features that I thought of
- [ ] Make vertices with degree 2 look nice
	- Specifically, make them appear flush with the two line segments
- [ ] Plus/minus vertex/line segment size button as seen in oriedita
- [ ] Export fold / svg
- [ ] Simulate with Origami Simulator
- [ ] Perturbation algorithm that alters input points to simplify the crease pattern
- [ ] Box select & move, box erase
### Stretch goals
- [ ] 'Animate' feature that creates a downloadable gif or video showing the model being folded, then cut, then unfolded. Something like [this nice gif here](https://en.wikipedia.org/wiki/Fold-and-cut_theorem#/media/File:FoldedKoch.gif)
- [ ] Text input for a *contiguous* fold N' cut font
	- [ ] Requires drawing a line and
- [ ] 