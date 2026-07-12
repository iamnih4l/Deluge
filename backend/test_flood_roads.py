import asyncio, websockets, json

async def test():
    async with websockets.connect("ws://localhost:8000/ws", max_size=100000000) as ws:
        # Get initial state
        raw = await ws.recv()
        state = json.loads(raw)
        payload = state["payload"]
        print(f"Initial: isRunning={payload['isRunning']}, time={payload['time']}, roads={len(payload['roads'])}")
        
        # Start the simulation
        print("Starting simulation...")
        await ws.send(json.dumps({"action": "set_running", "state": True}))
        
        # Also set speed to max for faster testing
        await ws.send(json.dumps({"action": "set_speed", "speed": 5.0}))
        
        # Listen for ticks and watch for flood/road changes
        for i in range(60):
            raw = await ws.recv()
            data = json.loads(raw)
            p = data["payload"]
            t = p.get("time", 0)
            fc = len(p.get("floodCells", []))
            rs = p.get("roadStatuses", {})
            
            if fc > 0 or rs:
                print(f"TICK: time={t:.1f}, floodCells={fc}, roadStatuses={len(rs)} affected")
                if rs:
                    items = list(rs.items())[:5]
                    print(f"  Sample road statuses: {items}")
                    print("SUCCESS: Flood is affecting roads!")
                    return
            
            if i % 10 == 0:
                print(f"TICK {i}: time={t:.1f}, floodCells={fc}, roadStatuses={len(rs)}")
        
        print("FAIL: No road status changes detected after 60 ticks")

asyncio.run(test())
