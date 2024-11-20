# README - CEH Repository

Bienvenue dans le dépôt CEH ! Suivez les instructions ci-dessous pour cloner ce dépôt et l'utiliser en local sur votre machine.

## Prérequis

- **Git** : Assurez-vous que Git est installé sur votre machine. Vous pouvez vérifier cela en exécutant la commande suivante dans votre terminal :

  ```sh
  git --version
  ```

  Si Git n'est pas installé, vous pouvez le télécharger et l'installer depuis [le site officiel de Git](https://git-scm.com/).

- **Node.js et npm** : Si le projet utilise des dépendances Node.js, assurez-vous que **Node.js** et **npm** sont installés. Vérifiez leur installation avec :

  ```sh
  node -v
  npm -v
  ```

  Si Node.js et npm ne sont pas installés, vous pouvez les télécharger depuis [le site officiel de Node.js](https://nodejs.org).

## Cloner le Dépôt

Pour cloner ce dépôt sur votre machine locale, suivez ces étapes :

1. Ouvrez un terminal (ou une invite de commande).
2. Naviguez vers le dossier dans lequel vous souhaitez cloner le projet :
   ```sh
   cd /chemin/vers/votre/dossier
   ```
3. Clonez le dépôt en utilisant la commande suivante :
   ```sh
   git clone https://github.com/dyurn/CEH.git
   ```
4. Accédez au dossier du projet cloné :
   ```sh
   cd CEH
   ```

## Installer les Dépendances

Si le projet utilise Node.js, vous devrez installer les dépendances nécessaires en exécutant la commande suivante :

```sh
npm install
```

Cela téléchargera et installera tous les modules nécessaires spécifiés dans le fichier `package.json`.

## Utilisation

Après avoir cloné le projet et installé les dépendances, vous pouvez démarrer l'application en local en utilisant la commande suivante :

```sh
npm start
```

Cela lancera le fichier `index.js` défini dans le fichier `package.json`.

Si vous souhaitez contribuer à ce projet, créez une nouvelle branche avant de commencer vos modifications :

1. Créez et basculez sur une nouvelle branche :
   ```sh
   git checkout -b ma-branche
   ```
2. Apportez vos modifications, puis ajoutez-les et commitez-les.
3. Poussez votre branche sur GitHub :
   ```sh
   git push origin ma-branche
   ```
4. Créez une **Pull Request** sur GitHub pour proposer vos changements.

Merci de votre intérêt pour ce projet CEH !
