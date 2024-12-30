# Transcendence

/!\ Je ne suis pas du tout certains de tout ce que je vais vous dire, donc prenez le temps de vérifier. 

SPA : Single page application
  2 possibilitées à mes yeux : 
    1 :
    - On sert le contenu static avec nginx, et ce contenu static est fait de js qui permet de se déplacer sans refaire de requête http. Pour le contenu dynamic, nginx transmet à django qui génère les réponses https.
    2 :
    - Lors de la première requette du client (login), on lui donne l'ensemble des infos nécessaire et ensuite le js fais le taff sans nouvelle requette (excepté post etc)
  -> tout ca pour dire que je n'ai pas encore bien copris comment le système de SPA s'imbrique dans notre projet.

° DJANGO
  Framework de fou. Je vais pas vous expliquer comment ca marche, le readme deviendrait superlong, mais regadez des tutos ca se comprend assez vite et apres on peut repondre a des questions entre nous.
    Point important : Django est un framework LOCAL, à savoir qu'il s'installe uniquement a la base du project. 
    Quand vous installez des dépendances, n'oubliez pas de mettre a jour "requirement.txt" en faisant la commande "pip freeze > requirement.txt". (Ca note l'ensemble des dependances actuels de l'environnement et ensuite on ré-utilise       ce fichier dans le dockerile de django pour toutes les installées dans le container)
  Je suis assez certains que l'ensemble des fichiers statics nécessaire au bon fonctionnement de django admin ne doivent pas etre dans le projet mais pour l'instant ils sont la.
° POSTGRESQL
  Base de données choisies dans les modules.
  Soucis actuel :
    1. Normalement django offre l'entière configuration de la base de donnée avec le principe de "model", mais il semble qu'il faille malgré tout créer la base de donnée. (mydb dans notre cas). Ca me parait bizarre cette affaire.
    2. On est censé sauvegarder la db dans un volume pour avoir des données persistantes (.data dans notre cas) mais le fichier reste vide peut importe ce que je fais... bizarre...
    3.  Le pannel admin de django permet d'accéder au model créé au préalable. Ca, ca marche. 
        Mais quand j'accède a la base de donné dans le container postgres et que je liste l'ensemble des tables de la db, rien ne s'affiche... bizarre... (A mon avis Django et postgres ne doivent pas correctement etre pairé)
° NGINX
    Serveur qui recoit les requettes (permet l'encryption du traffic a travers https).
    La ligne "include mime.types;" dans le .conf peut paraitre bizarre mais elle oblige l'affichage dans le bon type des fichiers, a ne pas retirer !
  
