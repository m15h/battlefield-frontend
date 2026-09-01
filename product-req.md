
Battlefield-frontend is not a game, but more like presentation tool.

The overview usage:
1. Person defines battlefield templates for later use.
2. Person starts new presentation from template.
3. Presentation state can be saved and resumed later.

Template requirements:
1. Template has a name.
2. Template is two dimensional field composed of squares.
3. Default template size is 10x10.
4. Person creates objects/ships on template by clicking or dragging cursor over fields.
5. For readability sake, when defining template, objects should be colored in different colors.
6. Objects can stand on neighbouring fields.
7. After saving template, it can be used to start game/presentation.

Presentation:
1. Presentation shows blank battlefield.
2. Person clicks squares on battlefield and Tool shows if it was hit or miss.
3. If every square of ship/object was hit, the object gets crossed out.
4. If every ship/object was destroyed/crossed out, presentation is finished.

Implementation details:
1. Use tanstack query, but save and load data in local storage (or any frontend side storage).
2. Try to keep code clean and neatly divided into subdirectories and components.