for file in *.yml; do
  mv -- "$file" "$file.disabled"
done
