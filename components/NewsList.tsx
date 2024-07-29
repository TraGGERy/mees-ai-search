import NewsItem from './NewsItem';
import styles from '../styles/NewsList.module.css';

const NewsList = ({ news }) => (
  <div className={styles.newsList}>
    {news.map((article, index) => (
      <NewsItem 
        key={index} 
        title={article.title} 
        description={article.description} 
        url={article.url} 
      />
    ))}
  </div>
);

export default NewsList;
