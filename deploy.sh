echo "Preparing npm"
npm i
npm run build
echo "Removing previous deployment"
rm -r docs/
echo "Cloning build"
mv build docs
echo "Preparing custom domain"
cp CNAME docs/
echo "Done..."
echo "Pushing to GIT"
git add --a
git commit -m 'updates'
git push origin
