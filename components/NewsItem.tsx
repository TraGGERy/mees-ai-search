const NewsItem = ({ title, description, url }) => (
    <article className={}>
      <h2><a href={url} target="_blank" rel="noopener noreferrer">{title}</a></h2>
      <p>{description}</p>
    </article>
  );
  
  export default NewsItem;