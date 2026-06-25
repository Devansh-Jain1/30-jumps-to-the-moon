package com.jumps.moon.game;

import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final PlatformGenerator platformGenerator;
    private final CopyOnWriteArrayList<WinRecord> winRecords = new CopyOnWriteArrayList<>();

    public GameService(PlatformGenerator platformGenerator) {
        this.platformGenerator = platformGenerator;
    }

    public GameStateResponse newGame() {
        long seed = System.currentTimeMillis();
        List<Platform> platforms = platformGenerator.generate(seed);
        return new GameStateResponse(seed, platforms);
    }

    public void saveWin(WinRecord record) {
        winRecords.add(record);
    }

    public List<WinRecord> getTopTen() {
        return winRecords.stream()
                .sorted(Comparator.comparingInt(WinRecord::deathCount)
                        .thenComparing(Comparator.comparingInt(WinRecord::score).reversed()))
                .limit(10)
                .collect(Collectors.toList());
    }
}
