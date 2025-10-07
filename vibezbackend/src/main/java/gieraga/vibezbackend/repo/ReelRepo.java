package gieraga.vibezbackend.repo;

import gieraga.vibezbackend.model.Reel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReelRepo extends JpaRepository<Reel, Long> {

}