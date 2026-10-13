# PokéSurvivor FR

Traduction française non officielle de [PokéSurvivor](https://pokesurvivor.com/),
le jeu de fan de [JPTER78](https://github.com/JPTER78/pokesurvivor), sous forme
d'extension de navigateur.

Le jeu existe en espagnol et en anglais. Cette extension ajoute le français :
menus, cartes, capacités, objets, missions, succès, nouveautés et affichage en
partie. Les noms de Pokémon, de capacités, d'objets et de types sont les noms
officiels français.

Ce projet n'est affilié ni à l'auteur du jeu, ni à Nintendo, Creatures, GAME
FREAK ou The Pokémon Company.

## Installation

1. Télécharge `pokesurvivor-fr.zip` depuis la page
   [Releases](https://github.com/KamelAkar/pokesurvivor-fr/releases) et
   décompresse-le dans un dossier que tu gardes.
2. Dans Chrome, Edge ou Brave, ouvre `chrome://extensions`.
3. Active le « Mode développeur ».
4. Clique sur « Charger l'extension non empaquetée » et choisis le dossier
   décompressé.

Ouvre ensuite <https://pokesurvivor.com/> : le jeu est en français.

### Depuis les sources

Il faut [Node.js](https://nodejs.org/) 24 ou plus récent.

```bash
npm install
```

```bash
npm run build
```

L'extension est alors dans le dossier `dist/`, à charger comme ci-dessus.

## Changer de langue

Dans le jeu, Réglages puis Graphismes : un bouton « Français » apparaît à côté
de « Español » et « English ». Choisir l'une des deux autres langues désactive
la traduction, sans toucher à l'extension. Le choix est mémorisé.

## Comment ça marche

Le jeu est écrit en espagnol et se traduit lui-même en anglais avec un
dictionnaire dont les clés sont les textes espagnols. L'extension reprend le
même principe : elle laisse le jeu en espagnol et remplace chaque texte
affiché par sa version française, dans la page, dans le canvas du jeu et dans
les boîtes de dialogue du navigateur. Elle ne modifie ni le jeu, ni la
sauvegarde, ni le compte, et ne demande aucune permission au-delà du site.

| Dossier | Contenu |
| --- | --- |
| `src/dictionary/data/` | La traduction, un fichier par domaine (`{ "texte espagnol": "texte français" }`) |
| `src/engine/` | Le moteur : phrase exacte, modèle à trous `{x}`, puis fragments |
| `src/page/` | Le branchement sur la page : DOM, canvas, choix de la langue |
| `scripts/` | Construction, aperçu local et outils de suivi du jeu |
| `tests/` | Tests du moteur et de la cohérence du dictionnaire |

## Suivre les mises à jour du jeu

Le jeu évolue souvent. Un texte ajouté depuis s'affiche en espagnol tant qu'il
n'est pas traduit. Pour trouver ce qui manque, il faut une copie du jeu dans
`upstream/` :

```bash
git clone https://github.com/JPTER78/pokesurvivor upstream
```

```bash
npm run coverage
```

La commande liste les textes du jeu absents du dictionnaire français, y
compris les nouveautés. Il suffit de les ajouter dans le fichier
`src/dictionary/data/` qui convient, puis de reconstruire.

Quand le jeu ajoute des Pokémon, leurs noms français se régénèrent depuis les
données de PokeAPI :

```bash
npm run names
```

## Développement

| Commande | Rôle |
| --- | --- |
| `npm run build` | Construit l'extension dans `dist/` |
| `npm run preview` | Sert la copie locale du jeu avec l'extension, sur <http://localhost:4173/> |
| `npm test` | Lance les tests |
| `npm run typecheck` | Vérifie les types |
| `npm run lint` | Vérifie le style du code |

Dans un modèle à trous, l'ordre compte : le premier modèle qui correspond est
utilisé. Un modèle long doit donc précéder un modèle court qu'il contient. Un
test échoue si un modèle est masqué par un autre.

## Limites connues

- « Psíquico » désigne à la fois le type et la capacité : les deux
  s'affichent « Psy », alors que la capacité s'appelle « Psyko ».
- Les pages annexes du site (guide, Pokédex en ligne) ne sont pas traduites.
- Les messages de maintenance du jeu restent en espagnol.

## Crédits et licence

Code sous licence MIT, voir [LICENSE](LICENSE). Le moteur de traduction
s'inspire de celui du jeu (`js/core/i18n.js`, MIT, JPTER78). Les noms
officiels viennent de [PokeAPI](https://pokeapi.co/). Pokémon et tous les noms
associés sont des marques de Nintendo, Creatures Inc., GAME FREAK et The
Pokémon Company.
